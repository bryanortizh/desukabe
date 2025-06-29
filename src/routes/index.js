const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../contract/apiDesuka");
const authenticateToken = require("../function/validateJWT");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { Controller } = require("../controllers/index");
const { ControllerAudio } = require("../controllers/audio");
const controller = new Controller();
const controllerAudio = new ControllerAudio();

function setRoutes(app) {
  /**
   * @swagger
   * /ux/documents:
   *   get:
   *     summary: Todo el test documentario de la API
   *     responses:
   *       200:
   *         description: Lista de endpoints de la API
   */
  app.use("/ux/documents", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  /**
   * @swagger
   * /ux-mobile/desuka/music:
   *   get:
   *     summary: Obtiene la lista de música general de todas las musicas registradas
   *     responses:
   *      200:
   *         description: Lista de canciones
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                   title:
   *                     type: string
   *                   artist:
   *                     type: string
   *                   album:
   *                    type: string
   *                   duration:
   *                     type: string
   *                   genre:
   *                     type: string
   *                   coverImage:
   *                    type: string
   *                   audioFile:
   *                     type: string
   */
  app.get(
    "/ux-mobile/desuka/music",
    authenticateToken,
    controllerAudio.getMusic
  );

  /**
   * @swagger
   * /ux-mobile/desuka/musicLike/:id:
   *   get:
   *     summary: Obtiene la musica registrada y verifica si contiene un like
   *     parameters:
   *       - in: query
   *         name: idMusic
   *         schema:
   *           type: string
   *         description: ID de la música para verificar si tiene un like
   *     responses:
   *      200:
   *         description: Encuentra la musica registrada y si esta contiene un like
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   idMusic:
   *                     type: integer
   *                   isLike:
   *                     type: boolean
   */
  app.get(
    "/ux-mobile/desuka/musicLike/:idMusic",
    authenticateToken,
    controllerAudio.getMusicLike
  );

  /**
   * @swagger
   * /ux-mobile/desuka/categoryMusic:
   *   get:
   *     summary: Obtiene la lista de música general de todas las musicas registradas
   *     responses:
   *      200:
   *         description: Lista de canciones
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                   name:
   *                     type: string
   *                   description:
   *                     type: string
   *                   image:
   *                    type: string
   *                   audioFiles:
   *                    type: array
   */
  app.get(
    "/ux-mobile/desuka/categoryMusic",
    authenticateToken,
    controllerAudio.getCategoryMusic
  );

  /**
   * @swagger
   * /ux-mobile/desuka/musicLike/:id:
   *   put:
   *     summary: Obtiene la musica registrada y verifica si contiene un like y lo actualiza
   *     parameters:
   *       - in: query
   *         name: idMusic
   *         schema:
   *           type: string
   *         description: ID de la música para verificar si tiene un like y cambiar su estado
   *     responses:
   *      200:
   *         description: Encuentra la musica registrada y actualiza si tiene un like true o false
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   idMusic:
   *                     type: integer
   *                   isLike:
   *                     type: boolean
   */
  app.put(
    "/ux-mobile/desuka/musicLike/:idMusic",
    authenticateToken,
    controllerAudio.changeMusicLike
  );

  /**
   * @swagger
   * /ux-mobile/desuka/logout:
   *   post:
   *     summary: Cierra la sesión del usuario y elimina el token
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: integer
   *                 description: ID del usuario
   *             required:
   *               - userId
   *     responses:
   *       200:
   *         description: Logout exitoso, token eliminado
   *       400:
   *         description: El userId es requerido
   *       401:
   *         description: Token no proporcionado o inválido
   *       404:
   *         description: No se encontró token para ese usuario
   */
  app.post(
    "/ux-mobile/desuka/logout",
    authenticateToken,
    controller.logoutUser
  );

  /**
   * @swagger
   * /ux-mobile/desuka/login:
   *   post:
   *     summary: Inicia sesión de usuario y retorna un token JWT
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             oneOf:
   *               - required: [uuid, type_register]
   *                 properties:
   *                   uuid:
   *                     type: string
   *                     description: UUID del usuario (para registro tipo 1)
   *                   type_register:
   *                     type: integer
   *                     enum: [1]
   *                     description: Tipo de registro (1 = UUID)
   *               - required: [email, password, type_register]
   *                 properties:
   *                   email:
   *                     type: string
   *                     description: Correo electrónico del usuario (para registro tipo 2)
   *                   password:
   *                     type: string
   *                     description: Contraseña del usuario
   *                   type_register:
   *                     type: integer
   *                     enum: [2]
   *                     description: Tipo de registro (2 = email/password)
   *     responses:
   *       200:
   *         description: Login exitoso, retorna token y datos del usuario
   *       400:
   *         description: Faltan parámetros requeridos o datos inválidos
   *       401:
   *         description: Credenciales incorrectas
   *       404:
   *         description: Usuario no encontrado
   */
  app.post("/ux-mobile/desuka/login", controller.loginUser);

  app.post("/ux-mobile/desuka/register", controller.registerUser);

  app.post("/ux-mobile/desuka/verify", controller.verifyUserToken);

  app.post(
    "/ux-mobile/desuka/music/create",
    upload.fields([
      { name: "audioFile", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
    ]),
    authenticateToken,
    controllerAudio.uploadMusic
  );
}

module.exports = setRoutes;
