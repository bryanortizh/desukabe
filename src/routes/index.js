function setRoutes(app) {
    const { Controller } = require('../controllers/index'); // Ensure correct import
    const controller = new Controller();


    app.get('/ux/desuka/music', controller.getMusic);
/*     app.post('/ux/desuka/music', controller.createMusic);
    app.put('/ux/desuka/music/:id', controller.updateMusic);
    app.delete('/ux/desuka/music/:id', controller.deleteMusic); */
}

module.exports = setRoutes;