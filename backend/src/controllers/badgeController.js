const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const Badge = require("../models/Badge");
const Employee = require("../models/Employee");

// Sanitize and clean the parsed data
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/^"+|"+$/g, "").trim(); 
};


exports.createBadge = async (req, res) => {
  const { name, description, img_link } = req.body;
  const { id: adminId } = req.user;

  try {
    const badge = await Badge.create({
      created_by_id: adminId,
      name,
      description,
      img_link,
    });

    res.status(201).json({
      message: "Badge created successfully",
      badge,
    });
  } catch (error) {
    console.error("Error creating badge:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBadges = async (req, res) => {
  try {
    const activeBadges = await Badge.find({ is_archived: false }).populate("created_by_id", "f_name l_name email");
    const archivedBadges = await Badge.find({ is_archived: true }).populate("created_by_id", "f_name l_name email");

    res.status(200).json({ activeBadges, archivedBadges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActiveBadges = async (req, res) => {
  try {
    const activeBadges = await Badge.find({ is_archived: false });
    res.status(200).json({ badges: activeBadges });
  } catch (error) {
    console.error("Error fetching active badges:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.uploadBadges = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    console.log("Uploaded file:", req.file);

    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    const extension = path.extname(req.file.originalname).toLowerCase();

    if (extension === ".xlsx") {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const badgeData = sheetData
        .map((row) => ({
          name: sanitizeString(row.name),
          description: sanitizeString(row.description),
          img_link: sanitizeString(row.img_link),
          is_archived: false,
        }))
        .filter((row) => row.name && row.description && row.img_link);

      if (badgeData.length === 0) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); 
        }
        return res.status(400).json({ message: "No valid data found in the file." });
      }

      // Perform the database update in bulk
      await Badge.bulkWrite(
        badgeData.map((badge) => ({
          updateOne: {
            filter: { name: badge.name },
            update: { $set: badge },
            upsert: true,
          },
        }))
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(200).json({ message: `${badgeData.length} badges uploaded successfully.` });
    } else {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); 
      }
      return res.status(400).json({ message: "Unsupported file type. Only .xlsx files are allowed." });
    }
  } catch (error) {
    console.error("Error uploading badges:", error);

    if (!res.headersSent) {
      res.status(500).json({ message: "Server error." });
    }
  }
};


exports.archiveBadges = async (req, res) => {
  const { ids } = req.body;

  try {
    await Badge.updateMany({ _id: { $in: ids } }, { is_archived: true });
    res.status(200).json({ message: "Badges archived successfully." });
  } catch (error) {
    console.error("Error archiving badges:", error);
    res.status(500).json({ message: "Failed to archive badges." });
  }
};

exports.restoreBadges = async (req, res) => {
  const { ids } = req.body;

  try {
    await Badge.updateMany({ _id: { $in: ids } }, { is_archived: false });
    res.status(200).json({ message: "Badges restored successfully." });
  } catch (error) {
    console.error("Error restoring badges:", error);
    res.status(500).json({ message: "Failed to restore badges." });
  }
};