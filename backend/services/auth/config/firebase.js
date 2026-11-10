import  admin from "firebase-admin"
import { initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import  serviceAccount from "../serviceAccountKey.json" with {type:"json"}

export const app=initializeApp({
  credential: cert(serviceAccount)
});
