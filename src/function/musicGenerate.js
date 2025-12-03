const fs = require("fs");
const sharp = require("sharp");
const QRCode = require("qrcode");
const cloudinary = require("cloudinary").v2;
require('dotenv').config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function optimizeImage(inputPath) {
  return sharp(inputPath).jpeg({ quality: 80 }).toBuffer();
}

async function generateQRBuffer(data) {
  return QRCode.toBuffer(data);
}

async function uploadFileToCloudinary(filePath, folder = "desuka", resource_type = "auto") {
  const res = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type,
  });
  return res;
}

async function uploadBufferToCloudinary(buffer, filename = `file_${Date.now()}`, folder = "desuka", resource_type = "image") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id: filename, resource_type },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

async function getAudioDuration(audioPath) {
  try {
    const mm = await import("music-metadata");
    const metadata = await mm.parseFile(audioPath);
    return metadata.format.duration || 0;
  } catch (err) {
    console.error("Error getAudioDuration:", err);
    return 0;
  }
}

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Error deleting file:", err);
  }
}

function renameFile(oldPath, newPath) {
  try {
    fs.renameSync(oldPath, newPath);
  } catch (err) {
    console.error("renameFile error:", err);
  }
}

module.exports = {
  optimizeImage,
  generateQRBuffer,
  uploadFileToCloudinary,
  uploadBufferToCloudinary,
  getAudioDuration,
  deleteFile,
  renameFile,
};