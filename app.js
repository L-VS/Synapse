// app.js - À utiliser si vous séparez le JS
document.addEventListener('DOMContentLoaded', () => {
  // Configuration
  const API_KEY = ["hf_tdRLuK", "LqQRuBwAU", "ltiXsMGh", "qXZMaYnzIlB"].join('');
  const MODEL = "HuggingFaceTB/SmolLM3-3B:hf-inference";
  
  // Éléments UI
  const chatContainer = document.getElementById('chat-container');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');

  // Détection langue
  const userLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
  const TEXTS = {
    fr: {
      welcome: "Bonjour ! Je suis Orion, prêt à vous aider.",
      thinking: "Réflexion en cours...",
      error: "Erreur de connexion. Réessayez."
    },
    en: {
      welcome: "Hello! I'm Orion, ready to assist you.",
      thinking: "Thinking...",
      error: "Connection error. Please retry."
    }
  };

  // Initialisation
  addBotMessage(TEXTS[userLang].welcome);

  // Événements
  sendBtn.addEventListener('click', handleSendMessage);
  userInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSendMessage());

  // Fonctions
  function addMessage(content, isUser = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageEl.textContent = content;
    chatContainer.appendChild(messageEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageEl;
  }

  function addBotMessage(content) {
    return addMessage(content, false);
  }

  function showTyping() {
    const typingEl = document.createElement('div');
    typingEl.className = 'message bot-message';
    typingEl.innerHTML = `
      <div class="typing-indicator">
        ${TEXTS[userLang].thinking}
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    chatContainer.appendChild(typingEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingEl;
  }

  async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Ajout du message utilisateur
    addMessage(message, true);
    userInput.value = '';
    userInput.focus();

    // Affichage indicateur de frappe
    const typingEl = showTyping();

    try {
      // Appel API
      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: message }]
        })
      });

      const data = await response.json();
      typingEl.remove();
      addBotMessage(data.choices[0].message.content);
    } catch (error) {
      typingEl.remove();
      addBotMessage(TEXTS[userLang].error);
      console.error("API Error:", error);
    }
  }
});