firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");
const loginSection = document.getElementById("loginSection");
const loggedInSection = document.getElementById("loggedInSection");
const userEmail = document.getElementById("userEmail");

auth.onAuthStateChanged((user) => {
  if (user) {
    loginSection.style.display = "none";
    loggedInSection.style.display = "block";
    userEmail.textContent = user.email;
  } else {
    loginSection.style.display = "block";
    loggedInSection.style.display = "none";
  }
});

loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.signInWithEmailAndPassword(email, password)
    .catch((error) => {
      errorMsg.textContent = error.message;
    });
});

logoutBtn.addEventListener("click", () => {
  auth.signOut();
});