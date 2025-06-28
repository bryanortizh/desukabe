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
    try {
      res.status(200).json(music);
    } catch (error) {
      return res.status(500).json({
        message: "Error al verificar usuario/token",
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
      const passwordHash = await encryptPassword.encryptPassword(password);
      const avatarGenerator = `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(
        nickname
      )}`;
      const now = new Date();
      const [result] = await pool.execute(
        "INSERT INTO user (nickname, email, password, uuid, type_register, type_user, avatar, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          nickname,
          email,
          passwordHash,
          uuid,
          type_register,
          type_user,
          avatarGenerator,
          now,
          now,
        ]
      );
      const userIdCreate = result.insertId;
      const token = jwt.sign({ userIdCreate, nickname, email }, JWT_SECRET);
      const status = "active";
      await pool.execute(
        "INSERT INTO token (token, userId, status) VALUES (?, ?, ?)",
        [token, userIdCreate, status]
      );

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

  async verifyUserToken(req, res) {
    const { userId, uuid } = req.body;
    try {
      let userRows, tokenRows;

      if (userId) {
        [userRows] = await pool.execute("SELECT * FROM user WHERE id = ?", [
          userId,
        ]);
      } else if (uuid) {
        [userRows] = await pool.execute("SELECT * FROM user WHERE uuid = ? and type_register = 1", [
          uuid,
        ]);
      } else {
        return res.status(400).json({ message: "Debe enviar userId o uuid" });
      }

      if (!userRows || userRows.length === 0) {
        return res.status(404).json({
          message: "Usuario no registrado en el sistema",
          errorCode: "UNKREG00",
        });
      }

      const user = userRows[0];

      [tokenRows] = await pool.execute(
        "SELECT t.token, t.status FROM token t WHERE t.userId = ?",
        [user.id]
      );

      if (tokenRows.length > 0) {
        return res.status(200).json({
          message: "Token vigente",
          user: user,
          response: tokenRows[0],
        });
      } else {
        return res.status(404).json({
          message: "Token no encontrado o no vigente",
          errorCode: "UNKREG02",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error al verificar usuario/token",
        error: error.message,
        errorCode: "UNKREG01",
      });
    }
  }

  async logoutUser(req, res) {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "El userId es requerido" });
    }
    try {
      const [result] = await pool.execute(
        "DELETE FROM token WHERE userId = ?",
        [userId]
      );
      if (result.affectedRows > 0) {
        return res
          .status(200)
          .json({ message: "Logout exitoso, token eliminado" });
      } else {
        return res
          .status(404)
          .json({ message: "No se encontró token para ese usuario" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al hacer logout", error: error.message });
    }
  }

  async loginUser(req, res) {
    const { type_register, uuid, email, password } = req.body;

    try {
      let user;
      if (type_register === 1) {
        if (!uuid) {
          return res.status(400).json({ message: "El uuid es requerido" });
        }
        const [rows] = await pool.execute(
          "SELECT * FROM user WHERE uuid = ? AND type_register = 1",
          [uuid]
        );
        if (rows.length === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        user = rows[0];
      } else if (type_register === 2) {
        if (!email || !password) {
          return res
            .status(400)
            .json({ message: "Correo y contraseña requeridos" });
        }
        const [rows] = await pool.execute(
          "SELECT * FROM user WHERE email = ? AND type_register = 2",
          [email]
        );
        if (rows.length === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        user = rows[0];
        const validPassword = (await encryptPassword.comparePassword)
          ? await encryptPassword.comparePassword(password, user.password)
          : await require("../function/passwordhash").comparePassword(
              password,
              user.password
            );
        if (!validPassword) {
          return res.status(401).json({ message: "Contraseña incorrecta" });
        }
      } else {
        return res.status(400).json({ message: "type_register inválido" });
      }

      await pool.execute("DELETE FROM token WHERE userId = ?", [user.id]);

      const token = jwt.sign(
        { userId: user.id, nickname: user.nickname, email: user.email },
        JWT_SECRET
      );
      const status = "active";
      const now = new Date();

      await pool.execute(
        "INSERT INTO token (token, userId, status) VALUES (?, ?, ?)",
        [token, user.id, status]
      );

      res.status(200).json({
        message: "Login exitoso",
        userId: user.id,
        nickname: user.nickname,
        email: user.email,
        uuid: user.uuid,
        type_register: user.type_register,
        type_user: user.type_user,
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Error en login", error: error.message });
    }
  }

  getCategoryMusic(req, res) {
    res.status(200).json(categoryMusic);
  }
}

module.exports = { Controller };
