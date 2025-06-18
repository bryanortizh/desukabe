const music = require('../../mock/dataAudio.json');
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


}

module.exports = { Controller };