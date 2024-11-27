const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  dep_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Department", 
    required: true 
  },
  country: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  zip: { 
    type: String, 
    required: true 
  },
  street: { 
    type: String, 
    required: true 
  },
});

module.exports = mongoose.model("Location", locationSchema);