const app = require("./app");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { connectDB } = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const PROJECT_ID = process.env.PROJECT_ID;

// Google Secret Manager Client
const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const [version] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`,
  });
  return version.payload.data.toString("utf8");
}

(async () => {
  try {
    let MONGO_URI;

    // Use Secret Manager in production, otherwise fallback to local .env
    if (process.env.NODE_ENV === "production") {
      const SECRET_NAME = process.env.SECRET_NAME || "MONGO_URI_ROBERTS";
      console.log("Fetching MongoDB URI from Google Secret Manager...");
      MONGO_URI = await getSecret(SECRET_NAME);
    } else {
      console.log("Using local MONGO_URI for development...");
      MONGO_URI = process.env.MONGO_URI;
    }

    // Set the environment variable
    process.env.MONGO_URI = MONGO_URI;

    // Connect to MongoDB
    await connectDB();

    // Start the server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Error fetching secrets or starting server:", error);
    process.exit(1);
  }
})();