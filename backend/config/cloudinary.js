// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import 'dotenv/config'; // Usando 'dotenv/config' para ES Modules

// 1. Configura o Cloudinary com as variáveis de ambiente
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true // Sempre use HTTPS
});

// 2. Define o storage do Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mini-querida-lacos', // O nome da pasta que usamos na função extractPublicId
    allowed_formats: ['jpeg', 'png', 'jpg'],
    // public_id: (req, file) => 'custom_id_prefix_' + Date.now(), // opcional
  },
});

// 3. Cria o middleware de upload
const upload = multer({ storage: storage });

// 4. Exporta para ser usado na rota
export { upload, cloudinary };