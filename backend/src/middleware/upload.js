const multer = require('multer');
const path = require('path');

// Storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../uploads"); 
      cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });
  
  const upload = multer({ storage });
  module.exports = upload;