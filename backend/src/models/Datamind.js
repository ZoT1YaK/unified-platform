const mongoose = require("mongoose");

const dataMindSchema = new mongoose.Schema({
  created_by_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  data_mind_type: {
    type: String,
    required: true,
    unique: true, 
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Datamind", dataMindSchema);
