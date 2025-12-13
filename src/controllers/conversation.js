require("dotenv").config();
const db = require("../database/conection.js");

exports.createConversation = async (req, res) => {
  const { userIds, isGroup } = req.body; // userIds: [1,2] o [1,2,3]
  try {
    if (!isGroup && userIds.length === 2) {
      const [userA, userB] = userIds.sort((a, b) => a - b);

      const [existing] = await db.query(
        `SELECT c.id AS conversationId
     FROM conversations c
     JOIN conversation_members cm ON cm.conversation_id = c.id
     WHERE c.is_group = 0
     GROUP BY c.id
     HAVING 
       COUNT(*) = 2
       AND SUM(cm.user_id = ?) = 1
       AND SUM(cm.user_id = ?) = 1`,
        [userA, userB]
      );
      if (existing.length > 0) {
        return res.json({
          conversationId: existing[0].conversationId,
          existed: true,
        });
      }
    }
    const [result] = await db.query(
      "INSERT INTO conversations (is_group) VALUES (?)",
      [isGroup]
    );
    const conversationId = result.insertId;
    for (const userId of userIds) {
      await db.query(
        "INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)",
        [conversationId, userId]
      );
    }
    res.json({ conversationId, created: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserConversations = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT 
        c.id AS conversationId,
        c.is_group,
        c.title,
        c.avatar_group,
        m.id AS messageId,
        m.content,
        m.created_at,
        CASE
          WHEN c.is_group = 1 THEN (SELECT u.nickname FROM user u WHERE u.id = m.user_id)
          ELSE (
            SELECT u2.nickname
            FROM conversation_members cm2
            JOIN user u2 ON u2.id = cm2.user_id
            WHERE cm2.conversation_id = c.id AND cm2.user_id != ?
            LIMIT 1
          )
        END AS nickname,
        CASE
          WHEN c.is_group = 1 THEN (SELECT u.avatar FROM user u WHERE u.id = m.user_id)
          ELSE (
            SELECT u2.avatar
            FROM conversation_members cm2
            JOIN user u2 ON u2.id = cm2.user_id
            WHERE cm2.conversation_id = c.id AND cm2.user_id != ?
            LIMIT 1
          )
        END AS avatar
      FROM conversations c
      JOIN conversation_members cm ON c.id = cm.conversation_id
      LEFT JOIN (
        SELECT m1.*
        FROM messages m1
        INNER JOIN (
          SELECT conversation_id, MAX(created_at) AS max_created
          FROM messages
          GROUP BY conversation_id
        ) latest ON m1.conversation_id = latest.conversation_id AND m1.created_at = latest.max_created
      ) m ON c.id = m.conversation_id
      WHERE cm.user_id = ?
      ORDER BY m.created_at DESC
      `,
      [userId, userId, userId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.userId;
  try {
    const [members] = await db.query(
      "SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
      [conversationId, userId]
    );
    if (members.length === 0) {
      return res
        .status(403)
        .json({ error: "No perteneces a esta conversación" });
    }

    const [rows] = await db.query(
      `SELECT m.*, u.nickname FROM messages m
       JOIN user u ON m.user_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { conversationId, userId, content } = req.body;
  try {
    await db.query(
      "INSERT INTO messages (conversation_id, user_id, content) VALUES (?, ?, ?)",
      [conversationId, userId, content]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
