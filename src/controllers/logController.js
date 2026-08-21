import runDevPulseAgent from "../utils/RunDevPulseAgent.js";
import firedb from "../utils/firebase.js";

export const ingestLog = async (req, res) => {
  try {
    const { service_name, environment, raw_log } = req.body;

    if (!raw_log || typeof raw_log !== "string") {
      return res.status(400).json({
        success: false,
        error: 'Field "raw_log" is required and must be a string.',
      });
    }

    // Acknowledge immediately (202 Accepted) so downstream applications don't time out
    res.status(202).json({
      success: true,
      message:
        "Crash log accepted. DevPulse Agent is processing asynchronously.",
    });

    // Run the agent pipeline in the background

    const safeServiceName =
      typeof service_name === "string" && service_name.trim()
        ? service_name.trim()
        : "unknown-service";

    runDevPulseAgent({
      service_name: safeServiceName,
      environment: environment || "production",
      raw_log,
    }).catch((err) => {
      console.error("❌ [DevPulse Agent Async Failure]:", err);
    });
  } catch (error) {
    console.error("❌ [Endpoint Error]:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const snapshot = await firedb
      .collection("incidents")
      .orderBy("created_at", "desc")
      .limit(50)
      .get();

    const incidents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res
      .status(200)
      .json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    console.error("❌ [Firestore Fetch Error]:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to retrieve incidents." });
  }
};
