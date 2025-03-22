firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");
const loginSection = document.getElementById("loginSection");
const loggedInSection = document.getElementById("loggedInSection");
const userEmail = document.getElementById("userEmail");

auth.onAuthStateChanged(async (user) => {
  if (user) {
    await user.reload();
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (user.emailVerified && userDoc.exists && userDoc.data().purchased === true) {
      loginSection.style.display = "none";
      loggedInSection.style.display = "block";
      userEmail.textContent = user.email;
    } else {
      auth.signOut();
      errorMsg.textContent = user.emailVerified
        ? "Account not activated. Purchase required."
        : "Please verify your email before logging in.";
    }
  } else {
    loginSection.style.display = "block";
    loggedInSection.style.display = "none";
  }
});

loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  errorMsg.textContent = "";
  auth.signInWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      await user.reload();
      if (!user.emailVerified) {
        auth.signOut();
        throw new Error("Please verify your email before logging in.");
      }
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (!userDoc.exists || userDoc.data().purchased !== true) {
        auth.signOut();
        throw new Error("Account not activated. Purchase required.");
      }
    })
    .catch((error) => {
      errorMsg.textContent = error.message;
    });
});

logoutBtn.addEventListener("click", () => {
  auth.signOut();
});
