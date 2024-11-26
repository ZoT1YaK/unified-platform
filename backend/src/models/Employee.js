const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  dep_num: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: false,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
  },
  f_name: {
    type: String,
    required: [true, "First name is required"],
  },
  l_name: {
    type: String,
    required: [true, "Last name is required"],
  },
  position: {
    type: String,
    required: [true, "Position is required"],
  },
  hire_date: {
    type: Date,
    required: true,
  },
  is_people_leader: {
    type: Boolean,
    default: false,
  },
  people_leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: false,
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