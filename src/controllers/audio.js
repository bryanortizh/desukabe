require("dotenv").config();
const pool = require("../database/conection.js");
const categoryMusic = require("../mock/category.json");
const isLikeMusic = require("../mock/isLikeMusic.json");
const {
  optimizeImage,
  uploadFileToCloudinary,
  uploadBufferToCloudinary,
  generateQRBuffer,
  deleteFile,
  getAudioDuration,
} = require("../function/musicGenerate.js");

class ControllerAudio {
  async getMusic(req, res) {
    try {
      const [rows] = await pool.execute("SELECT * FROM music");
      res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({
        message: "Error al obtener la música",
        error: error.message,
        errorCode: "UNKREG01",
      });
    }
  }

  getMusicLike(req, res) {
    const id = req.params.idMusic;
    const musicLike = isLikeMusic;
    if (id === ":idMusic") {
      return res
        .status(400)
        .json({ message: "El id de la música es requerido" });
    }

    if (musicLike.idMusic === Number(id)) {
      res.status(200).json(musicLike);
    } else {
      res
        .status(404)
        .json({ message: "No se ha encontrado la musica solicitada" });
    }
  }

  changeMusicLike(req, res) {
    const id = req.params.idMusic;
    const musicLike = isLikeMusic;
    if (id === ":idMusic") {
      return res
        .status(400)
        .json({ message: "El id de la música es requerido" });
    }

    if (musicLike.idMusic === Number(id)) {
      musicLike.isLike = !musicLike.isLike;
      res.status(200).json(musicLike);
    } else {
      res
        .status(404)
        .json({ message: "No se ha encontrado la musica solicitada" });
    }
  }

  getCategoryMusic(req, res) {
    res.status(200).json(categoryMusic);
  }

 async uploadMusic(req, res) {
    try {
      const createdBy = req.user && req.user.userId ? req.user.userId : null;
      if (!createdBy) {
        return res
          .status(401)
          .json({ message: "Token inválido o userId no encontrado" });
      }

      const { artist, album, genre } = req.body;
      const audioFile = req.files["audioFile"][0];
      const coverImage = req.files["coverImage"][0];

      const duration = await getAudioDuration(audioFile.path);

      // 2) Subir audio a Cloudinary
      const audioUploadRes = await uploadFileToCloudinary(audioFile.path, "desuka/audios", "auto");
      const audioFileUrl = audioUploadRes.secure_url;

      const optimizedCoverBuffer = await optimizeImage(coverImage.path);
      const coverUploadRes = await uploadBufferToCloudinary(
        optimizedCoverBuffer,
        `cover_${Date.now()}`,
        "desuka/covers",
        "image"
      );
      const coverImageUrl = coverUploadRes.secure_url;

      const nameMusic = audioFile.originalname.split(".").slice(0, -1).join(".");
      const qrData = JSON.stringify({
        name: nameMusic,
        artist,
        album,
        createdBy,
        audioFile: audioFileUrl,
      });
      const qrBuffer = await generateQRBuffer(qrData);
      const qrUploadRes = await uploadBufferToCloudinary(qrBuffer, `qr_${Date.now()}`, "desuka/qrs", "image");
      const qrImageUrl = qrUploadRes.secure_url;

      // 5) Eliminar archivos temporales locales
      deleteFile(audioFile.path);
      deleteFile(coverImage.path);

      // 6) Guardar en DB
      const [result] = await pool.execute(
        `INSERT INTO music (title, artist, album, duration, genre, coverImage, audioFile, qrImage, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nameMusic,
          artist,
          album,
          duration,
          genre,
          coverImageUrl,
          audioFileUrl,
          qrImageUrl,
          createdBy,
        ]
      );

      res.status(201).json({
        message: "Audio subido correctamente",
        id: result.insertId,
        nameMusic,
        artist,
        album,
        duration,
        genre,
        coverImage: coverImageUrl,
        audioFile: audioFileUrl,
        qrImage: qrImageUrl,
        createdBy,
      });
    } catch (error) {
      console.error("uploadMusic error:", error);
      res
        .status(500)
        .json({ message: "Error al subir música", error: error.message });
    }
  }
}
module.exports = { ControllerAudio };
