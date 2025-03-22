firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");
const toggleLink = document.getElementById("toggleLink");
const toggleText = document.getElementById("toggleText");
const errorMsg = document.getElementById("errorMsg");
const loginSignupContainer = document.getElementById("loginSignupContainer");
const loggedInSection = document.getElementById("loggedInSection");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

let isLoginMode = false;

toggleLink.addEventListener("click", (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    formTitle.textContent = isLoginMode ? "Login" : "Sign Up";
    submitBtn.textContent = isLoginMode ? "Login" : "Sign Up";
    toggleText.textContent = isLoginMode
        ? "Don't have an account? Sign Up"
        : "Already have an account? Login";
});

authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    errorMsg.textContent = "";

    if (isLoginMode) {
        auth.signInWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                await user.reload(); // Refresh user data
                console.log("User after login:", user.email, "Verified:", user.emailVerified);
                if (!user.emailVerified) {
                    auth.signOut();
                    throw new Error("Please verify your email before logging in.");
                }
                const userDoc = await db.collection("users").doc(user.uid).get();
                console.log("Firestore doc:", userDoc.exists ? userDoc.data() : "Not found");
                if (!userDoc.exists || userDoc.data().purchased !== true) {
                    auth.signOut();
                    throw new Error("Account not activated. Purchase required.");
                }
            })
            .catch((error) => {
                console.error("Login error:", error);
                errorMsg.textContent = error.message;
            });
    } else {
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userCredential.user.sendEmailVerification();
                errorMsg.textContent = "Verification email sent. Please check your inbox.";
                db.collection("users").doc(userCredential.user.uid).set({ purchased: false });
            })
            .catch((error) => {
                console.error("Signup error:", error);
                errorMsg.textContent = error.message;
            });
    }
});

auth.onAuthStateChanged(async (user) => {
    console.log("Auth state:", user ? user.uid : "No user");
    if (user) {
        await user.reload();
        console.log("User reloaded, Verified:", user.emailVerified);
        if (!user.emailVerified) {
            auth.signOut();
            errorMsg.textContent = "Please verify your email before logging in.";
            loginSignupContainer.style.display = "block";
            loggedInSection.style.display = "none";
            return;
        }
        const userDoc = await db.collection("users").doc(user.uid).get();
        console.log("Firestore check:", userDoc.exists ? userDoc.data() : "Not found");
        if (userDoc.exists && userDoc.data().purchased === true) {
            loginSignupContainer.style.display = "none";
            loggedInSection.style.display = "block";
            userEmail.textContent = user.email;
        } else {
            auth.signOut();
            errorMsg.textContent = "Account not activated. Purchase required.";
            loginSignupContainer.style.display = "block";
            loggedInSection.style.display = "none";
        }
    } else {
        loginSignupContainer.style.display = "block";
        loggedInSection.style.display = "none";
    }
});

logoutBtn.addEventListener("click", () => {
    auth.signOut();
});
