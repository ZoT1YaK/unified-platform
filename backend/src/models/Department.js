const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, "Department number is required"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Department name is required"],
  },
});

module.exports = mongoose.model("Department", departmentSchema);