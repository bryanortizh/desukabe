const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "davidmarlon1924@gmail.com",
        pass: "Tzsp7190"
    }
});

async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: '"Desuka App" <your-email@gmail.com>', // Remitente
            to:"bryanortiz156@hotmail.com", 
            subject:"CV", // Asunto
            text:"xd", // Texto plano
        });

        console.log('Correo enviado: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error;
    }
}
module.exports = { sendEmail };