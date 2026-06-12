/* ═══════════════════════════════════════════════════════════
   HARRY'S OVEN — Firebase Configuration
   ═══════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: "AIzaSyA0eDPpPVBD6wehiWU0PxAk4q0DZkDVLQo",
  authDomain: "harry-s-oven.firebaseapp.com",
  databaseURL: "https://harry-s-oven-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "harry-s-oven",
  storageBucket: "harry-s-oven.firebasestorage.app",
  messagingSenderId: "1096663116097",
  appId: "1:1096663116097:web:102b7fbab05d1605ba19c0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Database reference shortcut
const db = firebase.database();

// imgbb API key
const IMGBB_API_KEY = '87f13676e747b3b94affb51c1c8ebd7d';
