const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let gridFsBucket;

const connectDB = async () => {
  try {
    // Connect to MongoDB Atlas
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    // Set up GridFSBucket
    const db = mongoose.connection.db; // Get the native MongoDB database instance
    gridFsBucket = new GridFSBucket(db, { bucketName: "reports" }); // Bucket name: "reports"
    console.log("GridFSBucket initialized");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Function to get the initialized GridFSBucket
const getGridFsBucket = () => {
  if (!gridFsBucket) {
    throw new Error("GridFSBucket is not initialized. Call connectDB first.");
  }
  return gridFsBucket;
};

module.exports = { connectDB, getGridFsBucket };