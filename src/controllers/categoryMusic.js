const pool = require("../database/conection.js");
const { optimizeImage, uploadBufferToCloudinary } = require("../function/musicGenerate.js");

class ControllerCategoryMusic {
  async createCategory(req, res) {
    try {
      const createdBy = req.user && req.user.userId ? req.user.userId : null;
      if (!createdBy) return res.status(401).json({ message: "Token inválido o userId no encontrado" });

      const { title, description } = req.body;
      if (!title) return res.status(400).json({ message: "El título es requerido" });

      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "Falta la imagen de la categoría" });
      }

      // optimizar y subir a Cloudinary en carpeta desuka/category
      const optimized = await optimizeImage(req.file.buffer);
      const uploadRes = await uploadBufferToCloudinary(
        optimized,
        `category_${Date.now()}`,
        "desuka/category",
        "image"
      );
      const imageUrl = uploadRes.secure_url;

      const [result] = await pool.execute(
        `INSERT INTO music_categories (title, description, image, createdBy)
         VALUES (?, ?, ?, ?)`,
        [title, description || null, imageUrl, createdBy]
      );

      return res.status(201).json({
        id: result.insertId,
        title,
        description: description || null,
        image: imageUrl,
        createdBy,
      });
    } catch (err) {
      console.error("createCategory error:", err);
      return res.status(500).json({ message: "Error al crear categoría", error: err.message });
    }
  }

  async getCategoryMusic(req, res) {
    try {
      const [rows] = await pool.execute("SELECT * FROM music_categories");
      res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({
        message: "Error al obtener las categorías de música",
        error: error.message,
        errorCode: "UNKREG02",
      });
    }
  }
}

module.exports = new ControllerCategoryMusic();