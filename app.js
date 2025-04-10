import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC5FmiUVcFHfYhu6AVSGNcnCKcULUZ2Vpo",
  authDomain: "chatting-e2597.firebaseapp.com",
  projectId: "chatting-e2597",
  storageBucket: "chatting-e2597.appspot.com",
  messagingSenderId: "498567847234",
  appId: "1:498567847234:web:e4c112cfc78e03cf58fcdb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Prompt for username every time
let username = prompt("Enter your username:");
if (!username) username = "Anonymous";

// Set localStorage keys
const clearedKey = `cleared-messages-${username}`;
const joinedAtKey = `joined-at-${username}`;

// Store joined timestamp if not already set
let joinedAt = localStorage.getItem(joinedAtKey);
if (!joinedAt) {
  joinedAt = new Date().toISOString(); // save current time
  localStorage.setItem(joinedAtKey, joinedAt);
}

// Load cleared messages
let clearedMessages = JSON.parse(localStorage.getItem(clearedKey)) || [];

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const resetBtn = document.getElementById("reset-chat");

let allMessages = [];

// Send message
sendBtn.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  if (message !== "") {
    await addDoc(collection(db, "messages"), {
      username,
      message,
      timestamp: new Date()
    });
    messageInput.value = "";
  }
});

// Reset chat (for this user only)
resetBtn.addEventListener("click", () => {
  const toClear = allMessages.map(msg => msg.id);
  clearedMessages = [...new Set([...clearedMessages, ...toClear])];
  localStorage.setItem(clearedKey, JSON.stringify(clearedMessages));
  renderMessages();
});

// Firestore real-time listener
const q = query(collection(db, "messages"), orderBy("timestamp"));
onSnapshot(q, (snapshot) => {
  allMessages = [];
  snapshot.forEach((doc) => {
    allMessages.push({ id: doc.id, ...doc.data() });
  });
  renderMessages();
});

// Render messages conditionally
function renderMessages() {
  chatBox.innerHTML = "";
  const joinedTime = new Date(joinedAt);
  allMessages.forEach((msg) => {
    const msgTime = new Date(msg.timestamp?.seconds * 1000 || msg.timestamp);
    if (
      msgTime >= joinedTime && 
      !clearedMessages.includes(msg.id)
    ) {
      const msgEl = document.createElement("div");
      msgEl.innerHTML = `<strong>${msg.username}:</strong> ${msg.message}`;
      chatBox.appendChild(msgEl);
    }
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}
