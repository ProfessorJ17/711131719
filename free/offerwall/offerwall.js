// offerwall.js
import { auth } from '../firebase-config.js';
import { onAuthStateChanged } from "firebase/auth";

let user = null;

auth.onAuthStateChanged((currentUser) => {
  user = currentUser;
  if (user) {
    console.log("User logged in:", user.uid);
    // Load offers when user is logged in
    loadOffers();
  } else {
    console.log("No user signed in");
    // Show login/register buttons
    showLoginButtons();
  }
});

function showLoginButtons() {
  const loginButton = document.getElementById('login-button');
  const registerButton = document.getElementById('register-button');

  if (loginButton && registerButton) {
    loginButton.style.display = 'block';
    registerButton.style.display = 'block';

    loginButton.onclick = () => {
      auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then((result) => {
          console.log("User signed in:", result.user);
          loadOffers();
        })
        .catch((error) => {
          console.error("Error signing in user:", error);
        });
    };

    registerButton.onclick = () => {
      auth.createUserWithEmailAndPassword('newuser@example.com', 'password123')
        .then((result) => {
          console.log("User created:", result.user);
          loadOffers();
        })
        .catch((error) => {
          console.error("Error creating user:", error);
        });
    };
  }
}

function loadOffers() {
  // Load offers from BitLabs SDK
  const bitlabsScript = document.createElement("script");
  const token = "d51b2b0c-91de-4c91-b406-d75f4764c084"; // Your App/API Token
  const userId = user.uid; // Firebase Auth user ID

  bitlabsScript.src = `https://web.bitlabs.ai/web/v1?token=${token}&uid=${userId}`;
  bitlabsScript.async = true;
  document.head.appendChild(bitalbscript);

  bitlabsScript.onload = () => {
    console.log("BitLabs SDK loaded successfully for user ID:", userId);
    
    // Initialize BitLabs SDK here
    window.BitLabs.init({
      uid: userId,
      token: token,
      debug: false,
      callback: function(response) {
        console.log("BitLabs initialized:", response);
        
        // Get available offers
        window.BitLabs.getAvailableRewards(function(offers) {
          console.log("Available offers:", offers);
          
          // Render offers
          renderOffers(offers);
        }, function(error) {
          console.error("Error getting offers:", error);
        });
      }
    });
  };
}

function renderOffers(offers) {
  const offersContainer = document.getElementById('offers-container');
  
  if (offersContainer) {
    offersContainer.innerHTML = '';
    
    offers.forEach(offer => {
      const offerElement = document.createElement('div');
      offerElement.className = 'offer-card';
      
      const title = document.createElement('h3');
      title.textContent = offer.title;
      
      const description = document.createElement('p');
      description.textContent = offer.description;
      
      const button = document.createElement('button');
      button.textContent = 'Complete Offer';
      button.onclick = () => completeOffer(offer.id);
      
      offerElement.appendChild(title);
      offerElement.appendChild(description);
      offerElement.appendChild(button);
      
      offersContainer.appendChild(offerElement);
    });
  }
}

function completeOffer(offerId) {
  window.BitLabs.completeReward(offerId, function(response) {
    console.log("Reward completed:", response);
    
    // Update UI after successful completion
    const offerElement = document.querySelector(`.offer-card[data-id="${offerId}"]`);
    if (offerElement) {
      offerElement.style.display = 'none';
      showSuccessMessage(`Offer "${offerElement.querySelector('h3').textContent}" completed!`);
    }
    
    // Fetch new offers
    loadOffers();
  }, function(error) {
    console.error("Error completing reward:", error);
    showErrorMessage("Failed to complete offer. Please try again.");
  });
}

function showSuccessMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    document.body.removeChild(messageDiv);
  }, 3000);
}

function showErrorMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'error-message';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    document.body.removeChild(messageDiv);
  }, 3000);
}
