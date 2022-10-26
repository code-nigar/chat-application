import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import {
   getStorage,
   ref as sRef,
   uploadBytesResumable,
   getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js";
import { 
    getAuth,
    onAuthStateChanged,
    signOut 
  } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    onValue,
    child, 
    push, 
    update,
    remove 
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
  
const db = getDatabase();

const imgDiv = document.getElementById('profile-pic');

//GET CURRENT USER
var currentUser = {};
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    console.log(user);
    currentUser = user;
    // const db = getDatabase();
      onValue(ref(db, `users/${user.uid}`), (data)=>{
        console.log("data =>",data.val());
        document.getElementById("username").innerHTML = data.val().username;
        document.getElementById("profile-name").innerHTML = data.val().username;
        //document.getElementById("profile-icon").innerHTML = data.val().username[0];
        if(data.val().ImageURL){
          img.setAttribute('src', data.val().ImageURL);
        }
      })
  } else {
    // User is signed out
  }
});

var imgName, imgExt;

//CHANGE PROFILE PICTURE
//const imgDiv = document.getElementById('profile-pic');
const img = document.getElementById('profile-image');
const uploadBtn = document.getElementById('fileUpload-btn');
const file = document.getElementById('file');
const defaultIcon = document.getElementById('profile-icon');
var chosenFile;

imgDiv.addEventListener('mouseenter',()=>{
  uploadBtn.style.display = 'block';
});
imgDiv.addEventListener('mouseleave',()=>{
  uploadBtn.style.display = 'none';
});
file.addEventListener('change', function(){
  chosenFile = this.files[0];
  if(chosenFile){
    imgExt = getImgExt(chosenFile);
    imgName = getImgName(chosenFile);
    const reader = new FileReader();
    reader.addEventListener('load',()=>{
      img.setAttribute('src', reader.result)
    });
    reader.readAsDataURL(chosenFile);
    defaultIcon.style.display = "none";
  }
});

//get image extension
function getImgExt(theFile){
  let filename = theFile.name;
  return( filename.slice(filename.lastIndexOf('.'), filename.length));
}
//get image title
function getImgName(theFile){
  let filename = theFile.name;
  return( filename.slice(0,filename.lastIndexOf('.')));
}


//IMAGE UPLOAD FUNCTION
async function uploadProcess(){
    var imgToUpload = chosenFile;
    var imgFullName = imgName + imgExt;

    const metaData = {
        contentType: imgToUpload.type
    }

    const storage = getStorage();

    const storageRef = sRef(storage, "Images/"+imgFullName);

    const uploadTask = uploadBytesResumable(storageRef, imgToUpload, metaData);

    uploadTask.on('state-changed',(snapshot)=>{
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes)*100;
      console.log("upload "+progress+"%");
    },
    (error)=>{
      alert("Error .. image not uploaded");
    },
    
    ()=>{
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
        console.log(downloadURL);
        saveImageToRTDB(downloadURL,imgName,imgExt)
      }); 
    });
}

//EDIT & SAVE PROFILE Changes
function showNewName(){
  let newName = document.getElementById('profile-name').innerHTML;
  uploadProcess();
  let newPic  = img.src;
  console.log(newName,newPic);
  //code to store pic 
  //const db = getDatabase();
    update(ref(db, `users/${currentUser.uid}`), {
      username: newName,
    });
  
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

function saveImageToRTDB(URL,imgN,imgE){
  update(ref(db,`users/${currentUser.uid}`),{
    ImageName : imgN+imgE,
    ImageURL : URL
  });
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