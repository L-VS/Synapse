// Configuration
const PROXY_URL = "/api/hf-proxy"; // Utilise le proxy intégré à Vercel

async function queryOrion(prompt) {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response";
  } catch (error) {
    return "Service unavailable. Please try later.";
  }
}
// Éléments DOM
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Initialisation
addBotMessage("Hello! I'm Orion, your AI assistant. How can I help you today?");

// Événements
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Fonctions
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(`${role}-message`);
    
    if (content instanceof Array) {
        // Typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing');
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
    return addMessage('user', content);
}

function addBotMessage(content) {
    return addMessage('bot', content);
}

function showTyping() {
    const dots = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div')
    ];
    dots.forEach(dot => dot.classList.add('dot'));
    return addMessage('bot', dots);
}

async function queryOrion(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: 'user', content: prompt }],
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let message = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const data = JSON.parse(line.substring(5));
                    if (data.choices && data.choices[0].delta.content) {
                        message += data.choices[0].delta.content;
                        updateLastBotMessage(message);
                    }
                }
            }
        }

        return message;
    } catch (error) {
        console.error('Error:', error);
        return "Sorry, I'm having trouble connecting. Please try again later.";
    }
}

function updateLastBotMessage(content) {
    const lastMessage = chatMessages.lastChild;
    if (lastMessage && lastMessage.classList.contains('bot-message')) {
        lastMessage.textContent = content;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addUserMessage(message);
    userInput.value = '';
    userInput.focus();

    const typing = showTyping();
    const response = await queryOrion(message);
    
    // Remove typing indicator
    chatMessages.removeChild(typing);
    addBotMessage(response);
}

// PWA Installation
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
