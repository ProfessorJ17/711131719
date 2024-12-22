import { auth } from "../firebase-config.js";
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You must be logged in to access the offerwall.");
    window.location.href = "../freemoney.html";
  } else {
    // Dynamically set the userId for BitLabs SDK
    const bitlabsScript = document.createElement("script");
    const token = "d51b2b0c-91de-4c91-b406-d75f4764c084"; // BitLabs API token
    const userId = user.uid; // Firebase Auth user ID

    bitlabsScript.src = `https://web.bitlabs.ai/web/v1?token=${token}&uid=${userId}`;
    bitlabsScript.async = true;
    document.head.appendChild(bitlabsScript);

    bitlabsScript.onload = () => {
      console.log("BitLabs SDK loaded successfully for user ID:", userId);
    };
  }
});
