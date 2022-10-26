import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { 
  getAuth,
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  set, 
  onValue 
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyBdzIZhQEQ8y59mwj1N1fTyZQcm_GN0qvs",
  authDomain: "chat-app-45705.firebaseapp.com",
  projectId: "chat-app-45705",
  storageBucket: "chat-app-45705.appspot.com",
  messagingSenderId: "746028105598",
  appId: "1:746028105598:web:fa2d189c74759d5492fd2f",
  measurementId: "G-N6FKYWXXS7"
};
const app = initializeApp(firebaseConfig);


//GET CURRENT USER
const current_uid = localStorage.getItem("current-user-id");
let un = document.getElementById("username");

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    console.log(user);
    const db = getDatabase();
      onValue(ref(db, `users/${user.uid}`), (data)=>{
        console.log("data =>",data.val());
        un.innerHTML = data.val().username;
      })
  } else {
    // User is signed out
  }
});

//GENERATE EXISTING USER LIST FOR CONVERSATION by fetching from Firebase
const db = getDatabase();
const existingusers = ref(db, 'users');
onValue(existingusers, (snapshot) => {
  const data = snapshot.val();
  // updateStarCount(postElement, data);
  console.log(data);
  const propertyNames = Object.keys(data);
  console.log(propertyNames);
  let indx_of_cuid = propertyNames.indexOf(current_uid);
  var otherUsers = Object.values(data);
  otherUsers.splice(indx_of_cuid,1);
  console.log(otherUsers);
  addClickFun(otherUsers);
});

//FUNCTION for making existing userList
function makelist(userArr){
  for(let i=0; i<userArr.length; i++){
  document.getElementById("convo-list").innerHTML+=`
  <button class="convo-list-item flex-c"> 
  <div class="flex-r convo-header">
    <div class="flex-r convo-header-user">
      <div class="convo-icon">${checkforImg(userArr,i)}</div>
      <div class="convo-name">${userArr[i].username}</div>
    </div>
    <div class="convo-lastseen">2 min</div>
  </div>
  <div class="convo-last-message flex-r">hi how you doing Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus quidem ab ex soluta ad possimus vel, fugiat quam, voluptatibus, sapiente voluptates eum architecto doloremque omnis aspernatur sunt eveniet id officiis!</div>
</button>
     `
  }
}
function checkforImg(usrArrr,indx){
  if(usrArrr[indx].ImageURL){
    return(
      `<img class="convo-icon-image" src=${usrArrr[indx].ImageURL}>`
    )
  }else{
    return `${usrArrr[indx].username[0]}`;
  }
}
//FUNCTION for adding click event .. to begin conversation with selected user
async function addClickFun(usrArr){
  await makelist(usrArr);   //wait for userlist to appear on DOM
  var itemLists = document.getElementsByClassName('convo-list-item'); // 5 items
  for(let i=0; i<itemLists.length; i++){
   itemLists[i].addEventListener('click', ()=>{
     //do something
     document.getElementById("chatter-name").innerHTML = usrArr[i].username;
   })
  }
}

//logout
var LogoutBtn = document.getElementById("logout-btn");

LogoutBtn.addEventListener('click', function(){
    const auth = getAuth();
  signOut(auth).then(() => {
    console.log("Sign-out successful");// Sign-out successful.
  }).catch((error) => {
    console.log(error);// An error happened.
  });
    localStorage.setItem("current-user-id", "");
    goBack();
})

function goBack(){
    window.location.pathname = "index.html";
}