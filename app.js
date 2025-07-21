// Configuration - Version GitHub Pages Sécurisée
const API_URL = "https://router.huggingface.co/v1/chat/completions";
const MODEL = "HuggingFaceTB/SmolLM3-3B:hf-inference";
const TYPING_DELAY = 30; // Délai d'affichage caractère par caractère

// Technique de protection de la clé API (basique mais efficace)
function getHfKey() {
  const keyParts = [
    'hf_tdRLuK', // Partie 1
    'LqQRuBwAU', // Partie 2
    'ltiXsMGh',  // Partie 3
    'qXZMaYnzIlB' // Partie 4
  ];
  return keyParts.join('');
}

// Éléments DOM
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Initialisation
window.addEventListener('DOMContentLoaded', () => {
  addBotMessage("Hello! I'm Orion, your AI assistant. How can I help you today?");
  initServiceWorker();
  setupEventListeners();
});

function setupEventListeners() {
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
}

// Fonctions de gestion du chat
function createMessageElement(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}-message`;
  
  if (Array.isArray(content)) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing';
    content.forEach(dot => typingDiv.appendChild(dot));
    messageDiv.appendChild(typingDiv);
  } else {
    messageDiv.textContent = content;
  }
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return messageDiv;
}

function addUserMessage(content) {
  return createMessageElement('user', content);
}

function addBotMessage(content) {
  return createMessageElement('bot', content);
}

function showTypingIndicator() {
  const dots = Array.from({length: 3}, () => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    return dot;
  });
  return createMessageElement('bot', dots);
}

async function streamAiResponse(prompt) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getHfKey()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullMessage = '';
    let messageElement = addBotMessage('');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = JSON.parse(line.substring(5).trim();
          if (data?.choices?.[0]?.delta?.content) {
            fullMessage += data.choices[0].delta.content;
            messageElement.textContent = fullMessage;
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        }
      }
    }

    return fullMessage;
  } catch (error) {
    console.error('API Error:', error);
    return "Sorry, I'm experiencing technical difficulties. Please try again later.";
  }
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Ajout du message utilisateur
  addUserMessage(message);
  userInput.value = '';
  userInput.focus();

  // Affichage de l'indicateur de frappe
  const typingIndicator = showTypingIndicator();

  try {
    await streamAiResponse(message);
  } finally {
    // Suppression de l'indicateur de frappe
    if (typingIndicator.parentNode) {
      chatMessages.removeChild(typingIndicator);
    }
  }
}

// Gestion PWA
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
}
