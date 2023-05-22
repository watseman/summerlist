import { initializeApp} from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import {getAuth} from 'firebase/auth'; 


const firebaseConfig = {
    apiKey: "AIzaSyDMwoYzZ3CuUxpMlqiy6KjOfX-DSL0tvGk",
    authDomain: "summerlist-fd245.firebaseapp.com",
    databaseURL: "https://summerlist-fd245-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "summerlist-fd245",
    storageBucket: "summerlist-fd245.appspot.com",
    messagingSenderId: "565209392550",
    appId: "1:565209392550:web:e98bc084428a67dbf0db67",
    measurementId: "G-RLXGET8B1F"
  };

  const app = initializeApp(firebaseConfig);

  export const db = getFirestore(app);

  export const auth = getAuth(app);

  export const createUserDocument = async (user, additionalData) => {
    if (!user) return;
  
    const userRef = getFirestore.doc(`users/${user.uid}`);
  
    const snapshot = await userRef.get();
  
    if (!snapshot.exists) {
      const { email } = user;
      const { points  } = additionalData;
  
      try {
        await userRef.set({
          points,
          email,
          createdAt: new Date(),
        });
      } catch (error) {
        console.log('Error in creating user', error);
      }
    }
  };