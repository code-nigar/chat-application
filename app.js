import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getDatabase, ref, set, update,} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";

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
const analytics = getAnalytics(app);


//Authentication and registration
const auth = getAuth();

var registrationBtn = document.getElementById("register-btn");

registrationBtn.addEventListener('click', function(){
  let userName = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, pass)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log("User => ",user);
    //set data to realtime db
    const db = getDatabase();
    set(ref(db, `users/${user.uid}`), {
      username: userName,
      email: email,
      uid: user.uid
    });
    //succeess sweet alert
    Swal.fire({
      title: 'Registration Successful',
      icon: 'success',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
    //switch signup to login window
    var switchWindow = document.getElementById("input");
    switchWindow.checked = true;
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("ERROR => ",errorMessage);
    //error sweet alert
    Swal.fire({
      title: `${errorMessage}`,
      icon: 'error',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    })
    // ..
  });
});

//Login
var LoginBtn = document.getElementById("login-btn");

LoginBtn.addEventListener('click', function(){
  let loginMail = document.getElementById("l-email").value;
  let loginPass = document.getElementById("l-password").value;


  //const auth = getAuth();
  signInWithEmailAndPassword(auth, loginMail, loginPass)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log("User => ",user);
      
      localStorage.setItem("current-user-id", user.uid);
      //succeess sweet alert
      Swal.fire({
        title: 'Registration Successful',
        icon: 'success',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      goNewPath();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("ERROR => ",errorMessage);
      //error sweet alert
      Swal.fire({
        title: `${errorMessage}`,
        icon: 'error',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      }
    );
})



function goNewPath(){
  let currentPath = window.location.pathname;
  let newpath = currentPath.slice(0,currentPath.indexOf("index")) + "pages/chat-window/chatwindow.html"
  window.location.pathname = newpath;
}
