import { Octokit } from "@octokit/rest";
const octokitClient = new Octokit({auth: process.env.GITHUB_TOKEN});


 const dispatchGithubIssue = async (

  service_name,
  environment,
  raw_log,
  analysis,
) => {
  let githubIssueUrl = null;
  try {
    const issue = await octokitClient.rest.issues.create({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      title: `[DevPulse Alert - ${analysis.severity}] ${analysis.title}`,
      labels: ["bug", "automated-issue", service_name.toLowerCase()],
      body: `## 🤖 DevPulse Autonomous Incident Report

**Service:** \`${service_name}\` | **Environment:** \`${environment}\` | **Severity:** \`${analysis.severity}\`

---

### 🔍 Root Cause Analysis
${analysis.root_cause}

### 🛠️ Proposed Fix / Patch
\`\`\`javascript
${analysis.suggested_fix}
\`\`\`

### 💡 Prevention Strategy
${analysis.prevention_tip}

---

<details>
<summary><b>View Raw Log Trace</b></summary>

\`\`\`text
${raw_log}
\`\`\`

</details>

*Generated automatically by DevPulse Agent via ${process.env.GEMINI_MODEL}.*`,
    });

    githubIssueUrl = issue.data.html_url;
    console.log(`🐙 [GitHub] Successfully opened issue: ${githubIssueUrl}`);
  } catch (githubErr) {
    console.error(
      "⚠️ [GitHub API Error]: Failed to create issue:",
      githubErr.message,
    );
  }
  return githubIssueUrl;
};

export default dispatchGithubIssue;