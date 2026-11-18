import { initializeApp, cert } from "firebase-admin/app";
import { readFileSync } from "node:fs";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : JSON.parse(readFileSync(new URL("../serviceAccountKey.json", import.meta.url), "utf8"));

export const app = initializeApp({ credential: cert(serviceAccount) });