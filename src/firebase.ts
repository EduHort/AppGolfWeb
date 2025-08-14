// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { collection, getFirestore, serverTimestamp } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
/*
const firebaseConfig = {                                        // pord
  apiKey: "AIzaSyBCQf_BEhZZ2A5EyFlhdQ4-WC83ASLYWjc",
  authDomain: "appgolf-60b0d.firebaseapp.com",
  projectId: "appgolf-60b0d",
  storageBucket: "appgolf-60b0d.firebasestorage.app",
  messagingSenderId: "55974322091",
  appId: "1:55974322091:web:cd78fe3ae0a572dc65fcee"
};
*/

const firebaseConfig = {                                        // dev
    apiKey: "AIzaSyCsW33WkQ3TBmzPtIId_UTUaJMIMa2Cvrg",
    authDomain: "pitstop-golf-54a2b.firebaseapp.com",
    projectId: "pitstop-golf-54a2b",
    storageBucket: "pitstop-golf-54a2b.firebasestorage.app",
    messagingSenderId: "792753389506",
    appId: "1:792753389506:web:7b08c4e4660c227c1f205b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const questionarioCollection = collection(db, "questionario");
const questionariosCollection = collection(db, "questionarios");
const clientesCollection = collection(db, "clientes");
const carrinhosCollection = collection(db, "carrinhos");

export { serverTimestamp, questionarioCollection, questionariosCollection, clientesCollection, carrinhosCollection };