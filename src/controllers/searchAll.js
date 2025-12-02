require("dotenv").config();
const db = require("../database/conection.js");

exports.searchGeneral = async (req, res) => {
  const { searchTerm } = req.body;
  try {
    const [results] = await db.query(
      `
      SELECT
        id,
        title AS text,
        'audio' AS type,
        coverImage AS icon,
        album AS idTypeOrAlbum
      FROM music
      WHERE title LIKE CONCAT('%', ?, '%')
      UNION
      SELECT
        id,
        nickname AS text,
        'user' AS type,
        avatar AS icon,
        type_user AS idTypeOrAlbum
      FROM user
      WHERE nickname LIKE CONCAT('%', ?, '%')
      `,
      [searchTerm, searchTerm]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
