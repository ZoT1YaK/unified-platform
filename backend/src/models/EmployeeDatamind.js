const mongoose = require("mongoose");

const employeeDatamindSchema = new mongoose.Schema({
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  datamind_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Datamind",
    required: true,
  },
});

employeeDatamindSchema.index({ emp_id: 1, datamind_id: 1 }, { unique: true });

module.exports = mongoose.model("EmployeeDatamind", employeeDatamindSchema);