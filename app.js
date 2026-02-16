import { auth, provider, db, signInWithPopup, signOut }
from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ================= LOGIN SYSTEM =================

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginSection = document.getElementById("loginSection");
const mainSection = document.getElementById("mainSection");

loginBtn.onclick = async () => {
  await signInWithPopup(auth, provider);
  loginSection.classList.add("hidden");
  mainSection.classList.remove("hidden");
};

logoutBtn.onclick = async () => {
  await signOut(auth);
  location.reload();
};


// ================= WEBRTC CONFIG =================

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

let pc;
let localStream;


// ================= HELPER =================

function generateRoomId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function setupMedia() {
  pc = new RTCPeerConnection(servers);

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  document.getElementById("localVideo").srcObject = localStream;

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = event => {
    document.getElementById("remoteVideo").srcObject = event.streams[0];
  };
}


// ================= CREATE ROOM =================

document.getElementById("createRoom").onclick = async () => {

  await setupMedia();

  const roomId = generateRoomId();
  const roomRef = doc(db, "rooms", roomId);

  const callerCandidatesCollection =
    collection(roomRef, "callerCandidates");

  pc.onicecandidate = event => {
    if (event.candidate) {
      addDoc(callerCandidatesCollection, event.candidate.toJSON());
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await setDoc(roomRef, { offer });

  alert("Room Code: " + roomId);

  onSnapshot(roomRef, async snapshot => {
    const data = snapshot.data();
    if (data?.answer && !pc.currentRemoteDescription) {
      await pc.setRemoteDescription(data.answer);
    }
  });

  const calleeCandidatesCollection =
    collection(roomRef, "calleeCandidates");

  onSnapshot(calleeCandidatesCollection, snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
};


// ================= JOIN ROOM =================

document.getElementById("joinRoom").onclick = async () => {

  await setupMedia();

  const roomId = document.getElementById("roomInput").value.trim();
  const roomRef = doc(db, "rooms", roomId);
  const roomSnapshot = await getDoc(roomRef);

  if (!roomSnapshot.exists()) {
    alert("Room does not exist!");
    return;
  }

  const calleeCandidatesCollection =
    collection(roomRef, "calleeCandidates");

  pc.onicecandidate = event => {
    if (event.candidate) {
      addDoc(calleeCandidatesCollection, event.candidate.toJSON());
    }
  };

  const roomData = roomSnapshot.data();

  await pc.setRemoteDescription(roomData.offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  await setDoc(roomRef, { answer }, { merge: true });

  const callerCandidatesCollection =
    collection(roomRef, "callerCandidates");

  onSnapshot(callerCandidatesCollection, snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
};
