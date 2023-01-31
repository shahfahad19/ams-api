const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'photos/ams',
    allowedFormats: ['jpg', 'png', 'jpeg'],
    params: {
        transformation: [{ width: 400, height: 400, gravity: 'face', crop: 'fill' }],
    },
});

const upload = multer({ storage: storage });

module.exports = { upload };
