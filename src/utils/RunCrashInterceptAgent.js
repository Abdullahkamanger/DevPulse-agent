import ai from "./gemini.js";
import dispatchGithubIssue from "./github-octokit.js";
import { Type } from "@google/genai";
import firedb from "./firebase.js";

// ---------------------------------------------------------------------------
//  Core Autonomous Agent Workflow
// ---------------------------------------------------------------------------
async function runCrashInterceptAgent({ service_name, environment, raw_log }) {
  console.log(
    `\n🤖 [CrashIntercept] Intercepted crash from "${service_name}" (${environment}). Generating diagnosis...`,
  );

  //  Call Gemini with Structured Output Constraints
  const geminiResponse = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: `You are CrashIntercept, an autonomous backend reliability engineer agent. Analyze the provided crash log and output a diagnostic object.

Service: ${service_name}
Environment: ${environment}
Raw Crash Log:
${raw_log}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Short summary title of the crash",
          },
          root_cause: {
            type: Type.STRING,
            description: "Single-sentence explanation of root cause",
          },
          severity: {
            type: Type.STRING,
            enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
          },
          suggested_fix: {
            type: Type.STRING,
            description: "code snippet or patch fixing the issue",
          },
          prevention_tip: {
            type: Type.STRING,
            description: "Actionable tip to avoid recurrence",
          },
        },
        required: [
          "title",
          "root_cause",
          "severity",
          "suggested_fix",
          "prevention_tip",
        ],
      },
    },
  });

  let analysis;
  try {
    analysis = JSON.parse(geminiResponse.text);
    console.log(
      `✅ [Gemini] Diagnosis complete: "${analysis.title}" [Severity: ${analysis.severity}]`,
    );
  } catch (parseErr) {
    console.error("❌ Failed to parse Gemini structured JSON:", parseErr);
    return; // Abort gracefully without crashing node process
  }

  // Dispatch Automated GitHub Issue

  const githubIssueUrl = await dispatchGithubIssue(
    service_name,
    environment,
    raw_log,
    analysis,
  );

  if (githubIssueUrl) {
    console.log(`🐙 [GitHub] Issue created: ${githubIssueUrl}`);
  } else {
    console.warn(
      "⚠️ [GitHub] Issue creation failed. Proceeding to log incident in Firestore.",
    );
  }

  //  Persist Audit Record to Firestore
  const docRef = firedb.collection("incidents").doc();
  const incidentRecord = {
    incident_id: docRef.id,
    service_name,
    environment,
    raw_log,
    analysis,
    github_issue_url: githubIssueUrl,
    created_at: new Date().toISOString(),
  };

  await docRef.set(incidentRecord);
  console.log(`🔥 [Firestore] Incident recorded under ID: ${docRef.id}\n`);
}

export default runCrashInterceptAgent;
