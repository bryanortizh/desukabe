require("dotenv").config();
const pool = require("../database/conection.js");
const categoryMusic = require("../mock/category.json");
const isLikeMusic = require("../mock/isLikeMusic.json");

const path = require("path");
const {
  optimizeImage,
  renameFile,
  generateQR,
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
      const optimizedImageName = `optimized_${coverImage.filename}`;
      const optimizedImagePath = path.join("./uploads", optimizedImageName);

      await optimizeImage(coverImage.path, optimizedImagePath);

      let nameMusic = audioFile.originalname.split(".").slice(0, -1).join(".");

      const audioOriginalPath = audioFile.path;
      const audioFinalName = `${audioFile.filename}`;
      const audioFinalPath = path.join("./uploads", audioFinalName);
      renameFile(audioOriginalPath, audioFinalPath);

      const qrData = `MUSIC_${nameMusic}_${Date.now()}`;
      const qrImageName = `qr_${Date.now()}`;
      const qrImagePath = path.join("./uploads", qrImageName);
      await generateQR(qrImagePath, qrData);

      const baseUrl = "http://localhost:3000";
      const coverImageUrl = `${baseUrl}/uploads/${optimizedImageName}.jpg`;
      const audioFileUrl = `${baseUrl}/uploads/${audioFinalName}.mp3`;
      const qrImageUrl = `${baseUrl}/uploads/${qrImageName}.png`;

      const duration = await getAudioDuration(audioFile.path);

      deleteFile(coverImage.path);

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
        duration: duration,
        genre,
        coverImage: coverImageUrl,
        audioFile: audioFileUrl,
        qrImage: qrImageUrl,
        createdBy,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al subir música", error: error.message });
    }
  }
}
module.exports = { ControllerAudio };
