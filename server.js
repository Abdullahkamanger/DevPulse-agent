import "dotenv/config";
import express from "express";
import routes from "./src/routes/route.js";


const requiredEnvVars = [
  "GEMINI_API_KEY",
  "GITHUB_TOKEN",
  "GITHUB_OWNER",
  "GITHUB_REPO",
  "FIREBASE_SERVICE_ACCOUNT_KEY",
  "GEMINI_MODEL",
  
];
//to ensure no env var is missing
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`CRITICAL ERROR: Missing environment variable [${envVar}]`);
    process.exit(1);
  }
}

const app = express();
// Set a limit for incoming JSON payloads to prevent large requests from overwhelming the server
app.use(express.json({limit: "1mb"}));

app.use("/api/v1", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CrashIntercept Agent server running on http://localhost:${PORT}`);
});
