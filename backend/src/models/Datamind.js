const mongoose = require("mongoose");

const dataMindSchema = new mongoose.Schema({
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
