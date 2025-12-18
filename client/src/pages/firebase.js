
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyC5aTpu3eQAquJ4qvi4Wq7iddClANSbYlM",
  authDomain: "code-a-thon-98ccb.firebaseapp.com",
  projectId: "code-a-thon-98ccb",
  storageBucket: "code-a-thon-98ccb.firebasestorage.app",
  messagingSenderId: "1067655444924",
  appId: "1:1067655444924:web:7fb0753bf5795383e613b9",
  measurementId: "G-VC5RTJX9RJ"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);   