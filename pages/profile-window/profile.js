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
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    console.log(user);
    const db = getDatabase();
      onValue(ref(db, `users/${user.uid}`), (data)=>{
        console.log("data =>",data.val());
        document.getElementById("username").innerHTML = data.val().username;
        document.getElementById("profile-name").innerHTML = data.val().username;
        document.getElementById("profile-icon").innerHTML = data.val().username[0];
      })
  } else {
    // User is signed out
  }
});


const imgDiv = document.getElementById('profile-pic');
const img = document.getElementById('profile-image');
const uploadBtn = document.getElementById('fileUpload-btn');
const file = document.getElementById('file');
const defaultIcon = document.getElementById('profile-icon');

imgDiv.addEventListener('mouseenter',()=>{
  uploadBtn.style.display = 'block';
});
imgDiv.addEventListener('mouseleave',()=>{
  uploadBtn.style.display = 'none';
});
file.addEventListener('change', function(){
  const chosenFile = this.files[0];
  if(chosenFile){
    const reader = new FileReader();
    reader.addEventListener('load',()=>{
      img.setAttribute('src', reader.result)
    });
    reader.readAsDataURL(chosenFile);
    defaultIcon.innerHTML = "";
  }
});

function showNewName(){
  console.log(document.getElementById('profile-name').innerHTML);
  //code to store pic 
  /*
  
  */
 //succeess sweet alert
 Swal.fire({
  title: 'Changes Saved',
  icon: 'success',
  showClass: {
    popup: 'animate__animated animate__fadeInDown'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutUp'
  }
});
}
document.getElementById('save-btn').addEventListener('click',showNewName);


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