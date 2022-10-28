import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdzIZhQEQ8y59mwj1N1fTyZQcm_GN0qvs",
  authDomain: "chat-app-45705.firebaseapp.com",
  projectId: "chat-app-45705",
  storageBucket: "chat-app-45705.appspot.com",
  messagingSenderId: "746028105598",
  appId: "1:746028105598:web:fa2d189c74759d5492fd2f",
  measurementId: "G-N6FKYWXXS7",
};
const app = initializeApp(firebaseConfig);
const dbf = getFirestore(app);

//GET CURRENT USER
var current_uid;
var selectedUserforChat;
let un = document.getElementById("username");

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    console.log(user);
    current_uid = user.uid;
    const db = getDatabase();
    onValue(ref(db, `users/${user.uid}`), (data) => {
      console.log("data =>", data.val());
      un.innerHTML = data.val().username;
    });
  } else {
    // User is signed out
  }
});

//GENERATE EXISTING USER LIST FOR CONVERSATION by fetching from Firebase
const db = getDatabase();
const existingusers = ref(db, "users");
onValue(existingusers, (snapshot) => {
  const data = snapshot.val();
  // updateStarCount(postElement, data);
  console.log(data);
  const propertyNames = Object.keys(data);
  console.log(propertyNames);
  let indx_of_cuid = propertyNames.indexOf(current_uid);
  var otherUsers = Object.values(data);
  otherUsers.splice(indx_of_cuid, 1);
  console.log(otherUsers);
  addClickFun(otherUsers);
});

//FUNCTION for making existing userList
function makelist(userArr) {
  for (let i = 0; i < userArr.length; i++) {
    document.getElementById("convo-list").innerHTML += `
  <button class="convo-list-item flex-c"> 
  <div class="flex-r convo-header">
    <div class="flex-r convo-header-user">
      <div class="convo-icon">${checkforImg(userArr, i)}</div>
      <div class="convo-name">${userArr[i].username}</div>
    </div>
    <div class="convo-lastseen">2 min</div>
  </div>
  <div class="convo-last-message flex-r">hi how you doing Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus quidem ab ex soluta ad possimus vel, fugiat quam, voluptatibus, sapiente voluptates eum architecto doloremque omnis aspernatur sunt eveniet id officiis!</div>
</button>
     `;
  }
}
function checkforImg(usrArrr, indx) {
  if (usrArrr[indx].ImageURL) {
    return `<img class="convo-icon-image" src=${usrArrr[indx].ImageURL}>`;
  } else {
    return `${usrArrr[indx].username[0]}`;
  }
}
//FUNCTION for adding click event .. to begin conversation with selected user
async function addClickFun(usrArr) {
  await makelist(usrArr); //wait for userlist to appear on DOM
  var itemLists = document.getElementsByClassName("convo-list-item"); // 5 items
  for (let i = 0; i < itemLists.length; i++) {
    itemLists[i].addEventListener("click", () => {
      //do something
      document.getElementById("chatter-name").innerHTML = usrArr[i].username;
      selectedUserforChat = usrArr[i];
      console.log("start chatting with" + selectedUserforChat.uid);
      startChat(selectedUserforChat.uid, current_uid);
    });
  }
}

//CHAT FUNCTIONALITY
/**/
let chatBox = document.getElementById("chat-body");
let chatterDP = document.getElementById("chatter-profile-ico");
let messageList = document.getElementById("messageList");
let currentFriendChat;
let uniqueUid;

const startChat = async (friendUid, currentUid) => {
  currentFriendChat = friendUid;
  messageList.innerHTML = "";
  if (currentUid > friendUid) {
    uniqueUid = currentUid + friendUid;
  } else {
    uniqueUid = friendUid + currentUid;
  }

  const docRef = doc(dbf, "messages", `${uniqueUid}`);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());

    const unsub = onSnapshot(doc(dbf, "messages", `${uniqueUid}`), (doc) => {
      let xnm = doc.data().messageList;
      console.log(xnm);
      for (let i = 0; i < xnm.length; i++) {
        if(xnm[i].message != ""){
          if(xnm[i].sender == current_uid){
            messageList.innerHTML += `
            <li class="sender-message">
              <span>${xnm[i].message}</span>
              <span class="messageTime">${TStoTime(xnm[i].timestamp)}</span>
            </li>
            `;
          }else{
            messageList.innerHTML += `
          <li class="reciever-message">
            <span>${xnm[i].message}</span>
            <span class="messageTime">${TStoTime(xnm[i].timestamp)}</span>
          </li>
          `;
          //TStoTime(xnm[i].timestamp)
          //
          }
        }
      }
    });
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
    await setDoc(doc(dbf, "messages", `${uniqueUid}`), {
      messageList: arrayUnion({
        message: "",
        sender: auth.currentUser.uid,
        getter: currentFriendChat,
        chatId: uniqueUid,
        timestamp: new Date(),
      }),
    });
    console.log("new document created JN!");
  }
  // const q = query(
  //   collection(dbf, "messages"),
  //   where("chatId", "==", uniqueUid),
  //   orderBy("timestamp", "desc")
  // );
  // const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //   messageList.innerHTML = "";

  //   querySnapshot.forEach((doc) => {
  //     messageList.innerHTML += `
  //     <li>${doc.data().message}</li>
  //     `;
  //   });
  // });
};

window.startChat = startChat;
let messageValue = document.getElementById("messageValue");

const sendMessages = async () => {
  messageList.innerHTML = "";
  await updateDoc(doc(dbf, "messages", `${uniqueUid}`), {
    messageList: arrayUnion({
      message: messageValue.value,
      sender: auth.currentUser.uid,
      getter: currentFriendChat,
      chatId: uniqueUid,
      timestamp: new Date(),
    }),
  }).then(console.log("message sent"));
  messageValue.value = "";
};

window.sendMessages = sendMessages;
/* */

//logout
var LogoutBtn = document.getElementById("logout-btn");

LogoutBtn.addEventListener("click", function () {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      console.log("Sign-out successful"); // Sign-out successful.
    })
    .catch((error) => {
      console.log(error); // An error happened.
    });
  localStorage.setItem("current-user-id", "");
  goBack();
});

function goBack() {
  window.location.pathname = "index.html";
}

function TStoTime(ts){
  let t = ts.toDate();
  return(formatAMPM(t));
}
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}