const db = require("../database/conection.js");

async function loadSocket(io) {
  io.on("connection", (socket) => {
    socket.on("chat:join", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("user:join", (userId) => {
      socket.join(userId.toString());
    });

    socket.on("chat:mensaje", async (data) => {
      const { conversacionId, userId, content } = data;
      await db.query(
        "INSERT INTO messages (conversation_id, user_id, content) VALUES (?, ?, ?)",
        [conversacionId, userId, content]
      );
      io.to(conversacionId).emit("chat:mensaje", {
        conversationId: conversacionId,
        userId,
        content,
        created_at: new Date(),
      });

      const [members] = await db.query(
        "SELECT user_id FROM conversation_members WHERE conversation_id = ?",
        [conversacionId]
      );
      members.forEach(member => {
        io.to(member.user_id.toString()).emit("chat:updateList", {
          conversationId: conversacionId,
        });
      });
    });
  });
}
module.exports = loadSocket;