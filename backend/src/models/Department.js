const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Department", departmentSchema);