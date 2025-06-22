const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../contract/apiDesuka");
const { Controller } = require("../controllers/index");
const controller = new Controller();

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
  app.get("/ux-mobile/desuka/music", controller.getMusic);

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
  app.get("/ux-mobile/desuka/musicLike/:idMusic", controller.getMusicLike);
 
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
  app.get("/ux-mobile/desuka/categoryMusic", controller.getCategoryMusic);

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
  app.put("/ux-mobile/desuka/musicLike/:idMusic", controller.changeMusicLike);

  app.post("/ux-mobile/desuka/register", controller.registerUser);
}

module.exports = setRoutes;
