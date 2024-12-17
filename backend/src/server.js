const app = require("./app");
const { connectDB } = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    let MONGO_URI;
    let JWT_SECRET;

    // Use Secret Manager in production, otherwise fallback to local .env
    if (process.env.NODE_ENV === "production") {
      console.log("Fetching MongoDB URI from Google Secret Manager...");
      
      const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
      const client = new SecretManagerServiceClient();

      const getSecret = async (secretName) => {
        const [version] = await client.accessSecretVersion({
          name: `projects/${process.env.PROJECT_ID}/secrets/${secretName}/versions/latest`,
        });
        return version.payload.data.toString("utf8");
      };
      const SECRET_NAME = process.env.SECRET_NAME || "MONGO_URI_PRODUCTION";
      const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET";

      // Fetch MongoDB URI and JWT_SECRET
      MONGO_URI = await getSecret(SECRET_NAME);
      JWT_SECRET = await getSecret(JWT_SECRET);
      if (!MONGO_URI) {
        throw new Error("MongoDB URI is empty. Check Secret Manager configuration.");
      }
    } else {
      console.log("Using local MONGO_URI for development...");
      MONGO_URI = process.env.MONGO_URI;
      JWT_SECRET = process.env.JWT_SECRET;

      if (!MONGO_URI) {
        throw new Error("MONGO_URI is not set in the .env file.");
      }
    }

    // Set environment variables
    process.env.MONGO_URI = MONGO_URI;
    process.env.JWT_SECRET = JWT_SECRET;

    // Connect to MongoDB
    await connectDB();

    // Start the server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Error fetching secrets or starting server:", error);
    process.exit(1);
  }
})();