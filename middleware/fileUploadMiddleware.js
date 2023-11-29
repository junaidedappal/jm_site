// File upload middleware
const fileUpload = require('express-fileupload');

const uploadMiddleware = fileUpload();

module.exports = { uploadMiddleware };
