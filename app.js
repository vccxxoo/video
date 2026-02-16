import { auth, provider, db, signInWithPopup, signOut }
from "./firebase.js";

import {
  collection, addDoc, setDoc, doc,
  onSnapshot, getDoc
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let pc = new RTCPeerConnection();
let localStream;

async function setupMedia() {
  localStream = await navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
  });

  document.getElementById("localVideo").srcObject = localStream;

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = e => {
    document.getElementById("remoteVideo").srcObject = e.streams[0];
  };
}

document.getElementById("createRoom").onclick = async () => {
  await setupMedia();

  const roomRef = await addDoc(collection(db,"rooms"),{});

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await setDoc(roomRef,{ offer });

  alert("Room ID: " + roomRef.id);

  onSnapshot(roomRef, async snapshot=>{
    const data = snapshot.data();
    if(data?.answer){
      await pc.setRemoteDescription(data.answer);
    }
  });
};

document.getElementById("joinRoom").onclick = async () => {
  await setupMedia();

  const roomId = document.getElementById("roomInput").value;
  const roomRef = doc(db,"rooms",roomId);
  const roomSnap = await getDoc(roomRef);

  const data = roomSnap.data();

  await pc.setRemoteDescription(data.offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  await setDoc(roomRef,{ answer },{ merge:true });
};
