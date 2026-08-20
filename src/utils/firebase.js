import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (err) {
  console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON string.");
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const firedb = getFirestore();

export default firedb;
