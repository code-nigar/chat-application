import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  update,
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
    update(ref(db,`users/${user.uid}`),{  //change active status to online
      activeStatus : true,
      lastLogin : FullTimeString(new Date())
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

//FUNCTION for making existing users List
async function makelist(userArr) {
  for (let i = 0; i < userArr.length; i++) {
    document.getElementById("convo-list").innerHTML += `
  <button class="convo-list-item flex-c"> 
  <div class="flex-r convo-header">
    <div class="flex-r convo-header-user">
      <div class="convo-icon">${checkforImg(userArr, i)}</div>
      <div class="convo-name">${userArr[i].username}</div>
    </div>
    <div class="convo-lastseen">${checkforActiveStatus(userArr, i)}</div>
  </div>
  <div class="convo-last-message flex-r">${ await showLastMessage(userArr[i].uid, current_uid)}</div>
  </button>
     `; 
  }
}
//FUNCTION to render profile pic for existing users list
function checkforImg(usrArrr, indx) {
  if (usrArrr[indx].ImageURL) {
    return `<img class="convo-icon-image" src=${usrArrr[indx].ImageURL}>`;
  } else {
    return `${usrArrr[indx].username[0]}`;
  }
}
//FUNCTION to render active status for existing users list
function checkforActiveStatus(usrArrr, indx) {
  if (usrArrr[indx].activeStatus) {
    return `<i class="fa-solid fa-circle"></i>`;
  } else {
    if(usrArrr[indx].lastLogin){
      return `${showLastSeen(usrArrr[indx].lastLogin)}`;
    }
    else return `---`;
    //return `${(usrArrr[indx].lastLogin)}`;
  }
}
//FUNCTION for adding click event .. to begin conversation with selected user
async function addClickFun(usrArr) {
  await makelist(usrArr); //wait for userlist to appear on DOM
  var itemLists = document.getElementsByClassName("convo-list-item"); // all items from existing users list
  for (let i = 0; i < itemLists.length; i++) {
    itemLists[i].addEventListener("click", () => {
      //do something
      document.getElementById("chatter-name").innerHTML = usrArr[i].username;
      selectedUserforChat = usrArr[i];
      console.log("start chatting with" + selectedUserforChat.uid);
      startChat(selectedUserforChat.uid, current_uid);              //grab chat history and enable to carry on chat
      document.getElementById("send-btn").style.display = "inline-block"; //visible the button to send messages    
      if(screen.width <= 500){
        document.getElementById("chat-panel").style.display ='flex';
        document.getElementById("convo-panel").style.display = 'none';
      }
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

  const unsub = onSnapshot(doc(dbf, "messages", `${uniqueUid}`), (doc) => {
    messageList.innerHTML = "";
    let xnm = doc.data().messageList;
    console.log(xnm);
    for (let i = 0; i < xnm.length; i++) {
      if(xnm[i].message != ""){
        if(xnm[i].sender == current_uid){
          messageList.innerHTML += `
          <li class="sender-message flex-c">
            <div class="messageText">${xnm[i].message}</div>
            <div class="messageTime">${TStoTime(xnm[i].timestamp)}</div>
          </li>
          `;
        }else{
          messageList.innerHTML += `
        <li class="reciever-message flex-c">
          <div class="messageText">${xnm[i].message}</div>
          <div class="messageTime">${TStoTime(xnm[i].timestamp)}</div>
        </li>
        `;
        //TStoTime(xnm[i].timestamp)
        //
        }
      }
    }
    messageList.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
  });


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
//MESSAGE SENDING FUNCTION
const sendMessages = async () => {
  if(messageValue.value != ""){
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
  }else{alert("type a message")}
};

window.sendMessages = sendMessages;
/* */

//logout
var LogoutBtn = document.getElementById("logout-btn");

LogoutBtn.addEventListener("click", function () {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      localStorage.setItem("current-user-id", ""); 
      const db = getDatabase();
      update(ref(db,`users/${current_uid}`),{   //change active status to offline
        activeStatus : false,
        lastLogin : new Date()
        //lastLogin : FullTimeString(new Date())
      });
      current_uid = "";
      console.log("Sign-out successful"); // Sign-out successful.
      goBack();
    })
    .catch((error) => {
      console.log(error); // An error happened.
    });
});

function goBack() {
  window.location.pathname = "index.html";
}

function TStoTime(ts){
  let t = ts.toDate();
  let d = new Date();
  if(t.toDateString() == d.toDateString()){
    return(formatAMPM(t));
  }
  else{
    return(`${t.getDate()}/${t.getMonth()+1}/${t.getFullYear()} ${formatAMPM(t)}`);
  }
  //return(formatAMPM(t));
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

function FullTimeString(d){
  let JustDate = d.toString().slice(4,15);
  let JustTime = formatAMPM(d);
  console.log(JustDate +" "+ JustTime);
  return (JustDate +' '+ JustTime);
}

//Last Active Seen functionality
function showLastSeen(fts){     //fts means FullTimeString
  let ts = new Date(fts).getTime();
  let currentTime = new Date().getTime();
  let passedSec, passedMin, passedHr, passedDay;
  passedSec = Math.round(((currentTime) / 1000) % 60);
  passedMin = Math.floor(((currentTime - ts) / (60 * 1000)) % 60);
  passedHr = Math.floor(((currentTime - ts) / (60 * 60 * 1000)) % 24);
  passedDay = Math.floor(( currentTime - ts) / (24 * 60 * 60 * 1000));
  // console.log(
  //   passedSec + "s \n" + passedMin + "m \n" + passedHr + "h \n" + passedDay + "d"
  // );
  if(passedDay<=0){
    if(passedHr<=0){
      return passedMin+" min";
    } else return passedHr+" hr";
  }else return passedDay+" d";
}
//Function to show Last Send/Recieved Message
async function showLastMessage(friendID, usrID){
  let newID;
  if (usrID > friendID) {
    newID = usrID+friendID;
  } else {
    newID = friendID + usrID;
  }
  const docRef = doc(dbf, "messages", `${newID}`);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    let lengthOfMessageList = docSnap.data().messageList.length;
    console.log("last message:", docSnap.data().messageList[lengthOfMessageList-1].message);
    return (docSnap.data().messageList[lengthOfMessageList-1].message);
  } else {
    // doc.data() will be undefined in this case
    console.log("No last message found!");
    return "";
  }
}

document.getElementById("friendlist-btn").addEventListener('click',()=>{
  if(screen.width <=500){ 
    document.getElementById("chat-panel").style =`display: none;`;
    document.getElementById("convo-panel").style.display = 'flex';
    document.getElementById("chatwindow-btn").style = `background: none;`
  }
})