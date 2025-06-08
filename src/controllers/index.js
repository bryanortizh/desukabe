const { sendEmail } = require("../services/email");

class Controller {
    getMusic(req, res) {
        console.log("req", req);
        console.log("res", res);
        res.status(200).json({ message: "Resource fetched successfully" });
        console.log("res", res);
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

    async sendMail(req, res) {
        try {
            // Ejemplo de envío de correo
            await sendEmail(
                'recipient@example.com',
                'Bienvenido a Desuka',
                'Gracias por usar nuestra aplicación.',
                '<h1>Gracias por usar nuestra aplicación.</h1>'
            );

            res.status(200).json({ message: 'Correo enviado y recurso obtenido correctamente' });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error al enviar el correo', 
                error: error.message 
            });
        }
    }
}

module.exports = { Controller };