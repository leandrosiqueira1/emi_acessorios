// backend/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage do Multer para Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mini-querida-lacos", // pasta no Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // formatos permitidos
    transformation: [{ width: 800, height: 800, crop: "limit" }], // redimensiona se necessário
  },
});

// Upload via Multer
const upload = multer({ storage });

export { cloudinary, upload };
