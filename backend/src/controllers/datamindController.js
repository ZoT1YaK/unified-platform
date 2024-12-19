const Datamind = require("../models/Datamind");
const Employee = require("../models/Employee");
const xlsx = require("xlsx");

// Sanitize and clean the parsed data
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/^"+|"+$/g, "").trim(); 
};

/**
 * @desc    Upload Datamind values from an Excel (.xlsx) file.
 *          - Parses and sanitizes data from the uploaded file.
 *          - Inserts unique Datamind values into the database.
 * @route   POST /api/datamind/upload
 * @access  Private (Admin only)
 */
exports.uploadDatamind = async (req, res) => {
  const { id } = req.user;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Save Datamind values to the database
    const dataMindValues = sheetData.map((row) => ({
      data_mind_type: sanitizeString(row.data_mind_type),
      created_by_id: id,
    }));

    // Insert only unique values
    await Datamind.insertMany(dataMindValues, { ordered: false }).catch((err) => {
      if (err.code !== 11000) throw err; 
    });

    res.status(200).json({ message: "Datamind values uploaded successfully." });
  } catch (error) {
    console.error("Error uploading Datamind values:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Fetch all Datamind values from the database.
 * @route   GET /api/datamind/get
 * @access  Private (Requires token validation)
 */
exports.getAllDatamind = async (req, res) => {
  try {
    const dataMinds = await Datamind.find();
    res.status(200).json({ dataMinds });
  } catch (error) {
    console.error("Error fetching Datamind values:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Reset all Datamind values by deleting all records.
 * @route   DELETE /api/datamind/reset
 * @access  Private (Admin only)
 */
exports.resetDatamind = async (req, res) => {
  try {
    await Datamind.deleteMany({});
    res.status(200).json({ message: "All Datamind values have been reset." });
  } catch (error) {
    console.error("Error resetting Datamind values:", error);
    res.status(500).json({ message: "Server error" });
  }
};
