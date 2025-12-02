const db = require("../database/conection.js");
//a) Seguir a un usuario
exports.followUser = async (req, res) => {
  const follower_id = req.user.userId; // del token
  const { followed_id } = req.body;
  console.log("followUser", follower_id, followed_id);
  if (follower_id === followed_id) return res.status(400).json({ error: "No puedes seguirte a ti mismo" });
  try {
    await db.query(
      "INSERT IGNORE INTO followers (follower_id, followed_id) VALUES (?, ?)",
      [follower_id, followed_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Dejar de seguir a un usuario
exports.unfollowUser = async (req, res) => {
  const follower_id = req.user.userId;
  const { followed_id } = req.body;
  console.log("followUserXDD", follower_id, followed_id);

  try {
    await db.query(
      "DELETE FROM followers WHERE follower_id = ? AND followed_id = ?",
      [follower_id, followed_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//c) Obtener seguidores de un usuario

exports.getFollowers = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.nickname, u.avatar
       FROM followers f
       JOIN user u ON u.id = f.follower_id
       WHERE f.followed_id = ?`, [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// d) Obtener a quién sigue un usuario
exports.getFollowing = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.nickname, u.avatar
       FROM followers f
       JOIN user u ON u.id = f.followed_id
       WHERE f.follower_id = ?`, [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.isFollowing = async (req, res) => {
  const follower_id = req.user.userId; // del token
  console.log("isFollowing", follower_id);
  const { followed_id } = req.params;
  console.log("isFollowing", followed_id);
  try {
    const [rows] = await db.query(
      "SELECT 1 FROM followers WHERE follower_id = ? AND followed_id = ?",
      [follower_id, followed_id]
    );
    res.json({ isFollowing: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};