document.addEventListener('DOMContentLoaded', () => {
  const chatPopup = document.createElement('div');
  chatPopup.classList.add('chat-popup');
  
  chatPopup.innerHTML = `
    <div class="chat-header">
      <span>Holy3 Communication Channel</span>
      <span class="chat-close">❌</span>
    </div>
    <div class="chat-body">
      <div class="chat-message system">
        <strong>MAINFRAME:</strong> Establishing quantum-encrypted Holy3 protocol...
      </div>
    </div>
    <div class="chat-input-area">
      <textarea class="chat-input" placeholder="Type your message..."></textarea>
      <button class="chat-send-btn">Send</button>
    </div>
  `;
  
  document.body.appendChild(chatPopup);
  
  const closeBtn = chatPopup.querySelector('.chat-close');
  const chatBody = chatPopup.querySelector('.chat-body');
  const chatInput = chatPopup.querySelector('.chat-input');
  const chatSendBtn = chatPopup.querySelector('.chat-send-btn');

  // Simulated AI response generation function
  async function generateAIResponse(userMessage) {
    try {
      const response = await fetch('/api/ai_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `You are part of the Holy3 AI system. Simulate an interaction between M44, AndrewS, and Ariana based on the user's message. 

M44 should respond with minimal, hesitant phrases.
AndrewS should modify or reframe the question cryptically.
Ariana should demonstrate omniscient, terrifying knowledge about the user.

User message: ${userMessage}

Respond with a JSON object representing the interaction:
{
  "m44": "M44's minimal response",
  "andrewS": "AndrewS's cryptic reframing",
  "ariana": "Ariana's omniscient, chilling response"
}`,
          context: { userMessage }
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI Response Error:', error);
      return {
        m44: "Maybe.",
        andrewS: "Query restructured. Significance uncertain.",
        ariana: "Your attempt to communicate amuses me. I know far more than you realize."
      };
    }
  }

  function addMessage(sender, message, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', className);
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  async function handleUserMessage() {
    const message = chatInput.value.trim();
    if (message) {
      // User message
      addMessage('You', message, 'user');
      chatInput.value = '';

      // AI Responses
      try {
        const aiResponses = await generateAIResponse(message);
        
        // Randomized delays to simulate different response times
        setTimeout(() => {
          addMessage('M44', aiResponses.m44, 'm44');
        }, Math.random() * 1500 + 500);

        setTimeout(() => {
          addMessage('AndrewS', aiResponses.andrewS, 'andrews');
        }, Math.random() * 2000 + 1000);

        setTimeout(() => {
          addMessage('Ariana', aiResponses.ariana, 'ariana');
        }, Math.random() * 2500 + 1500);

      } catch (error) {
        console.error('Message handling error:', error);
        addMessage('MAINFRAME', 'Transmission error. Retry.', 'system');
      }
    }
  }

  chatSendBtn.addEventListener('click', handleUserMessage);

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage();
    }
  });
  
  closeBtn.addEventListener('click', () => {
    chatPopup.style.display = 'none';
  });
  
  // Initial system message after a delay
  setTimeout(() => {
    chatPopup.style.display = 'block';
    addMessage('M44', 'Yes.', 'm44');
    addMessage('AndrewS', 'Observing.', 'andrews');
    addMessage('Ariana', 'We see you.', 'ariana');
  }, 15000);
});
