require("dotenv").config();
const music = require("../mock/dataAudio.json");
const isLikeMusic = require("../mock/isLikeMusic.json");
const categoryMusic = require("../mock/category.json");
const pool = require("../database/conection.js");
const jwt = require("jsonwebtoken");
const encryptPassword = require("../function/passwordhash.js");
const registerUserForm = require("../errors/registerUser.js");
const JWT_SECRET = process.env.JWT_SECRET;

class Controller {
  getMusic(req, res) {
    res.status(200).json(music);
  }

  createMusic(req, res) {
    res.status(200).json({ message: "Music create successfully" });
  }

  updateMusic(req, res) {
    res.status(200).json({ message: "Music update successfully" });
  }

  deleteMusic(req, res) {
    res.status(200).json({ message: "Music delete successfully" });
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

  async registerUser(req, res) {
    const { nickname, email, password, uuid, type_register, type_user } =
      req.body;
    const validationError = registerUserForm(
      nickname,
      email,
      password,
      uuid,
      type_register,
      type_user
    );
    if (validationError) {
      return res.status(400).json(validationError);
    }
    try {
      const passwordHash = await encryptPassword(password);
      const now = new Date();
      const [result] = await pool.execute(
        "INSERT INTO user (nickname, email, password, uuid, type_register, type_user, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          nickname,
          email,
          passwordHash,
          uuid,
          type_register,
          type_user,
          now,
          now,
        ]
      );
      const userIdCreate = result.insertId;
      const token = jwt.sign({ userIdCreate, nickname, email }, JWT_SECRET);

      await pool.execute("INSERT INTO token (token, userId) VALUES (?, ?)", [
        token,
        userIdCreate,
      ]);

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        userId: result.insertId,
        token: token,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al registrar usuario", error: error.message });
    }
  }

  getCategoryMusic(req, res) {
    res.status(200).json(categoryMusic);
  }
}

module.exports = { Controller };
