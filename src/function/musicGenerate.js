const fs = require("fs");
const mm = require("music-metadata");
const sharp = require("sharp");
const QRCode = require("qrcode");

async function optimizeImage(inputPath, outputPath) {
  await sharp(inputPath).jpeg({ quality: 80 }).toFile(outputPath);
}

function renameFile(oldPath, newPath) {
  fs.renameSync(oldPath, newPath);
}

async function generateQR(qrPath, data) {
  await QRCode.toFile(qrPath, data);
}

async function getAudioDuration(audioPath) {
  const tempAudioPath = audioPath + ".mp3";
  fs.copyFileSync(audioPath, tempAudioPath);
  let duration = 0;
  try {
    const metadata = await mm.parseFile(tempAudioPath);
    duration = metadata.format.duration || 0;
  } catch (err) {
    console.error("Error al obtener la duración de la música:", err);
  }
  fs.unlinkSync(tempAudioPath);
  return duration;
}

function deleteFile(filePath) {
  fs.unlinkSync(filePath);
}
module.exports = {
  optimizeImage,
  renameFile,
  generateQR,
  getAudioDuration,
  deleteFile,
};
