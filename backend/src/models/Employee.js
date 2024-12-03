const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  dep_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  f_name: {
    type: String,
    required: true,
  },
  l_name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  hire_date: {
    type: Date,
    required: true,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  is_people_leader: {
    type: Boolean,
    default: false,
  },
  preferred_language: { 
    type: String, 
    default: "en" 
  },
  people_leader_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: false,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compare passwords
employeeSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);