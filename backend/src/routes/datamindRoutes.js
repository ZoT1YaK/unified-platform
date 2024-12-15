const express = require("express");
const multer = require("multer");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const datamindController = require("../controllers/datamindController");

const router = express.Router();


// Upload Datamind values
router.post("/upload", verifyToken, verifyAdmin, upload.single("file"), datamindController.uploadDatamind);

// Fetch all Datamind values
router.get("/get", verifyToken, datamindController.getAllDatamind);

// Reset all Datamind values
router.delete("/reset", verifyToken, verifyAdmin, datamindController.resetDatamind);

module.exports = router;
