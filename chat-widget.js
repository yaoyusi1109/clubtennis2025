// chat-widget.js

document.addEventListener('DOMContentLoaded', () => {
  const chatBubble = document.getElementById('chat-bubble');
  const chatWindow = document.getElementById('chat-window');
  const closeChat = document.getElementById('close-chat');
  const chatBody = document.getElementById('chat-body');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-message');

  // Function to toggle the chat window's visibility
  const toggleChatWindow = () => {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
      chatInput?.focus();
    }
  };

  // Render a message bubble
  const appendMessage = (text, role = 'received') => {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  // Conversation state we send to backend
  const history = [
    { role: 'system', content: 'You are a helpful assistant for the VT Club Tennis website. Be concise, accurate, and polite.' }
  ];

  async function sendMessage(text) {
    // Echo locally
    appendMessage(text, 'sent');
    history.push({ role: 'user', content: text });

    // Call Netlify Function
    try {
      sendBtn.disabled = true;
      chatInput.disabled = true;

      const resp = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        let msg = 'Sorry—there was an error. Please try again.';
        try {
          const parsed = JSON.parse(errText);
          if (parsed?.error) msg += `\n${parsed.error}`;
        } catch {}
        appendMessage(msg);
        console.error('Chat error:', errText);
        return;
      }

      const data = await resp.json();
      const reply = data?.content || '(no response)';
      appendMessage(reply, 'received');
      history.push({ role: 'assistant', content: reply });
    } catch (e) {
      appendMessage('Network error. Please try again.');
      console.error(e);
    } finally {
      sendBtn.disabled = false;
      chatInput.disabled = false;
      chatInput.focus();
    }
  }

  // Event listeners
  chatBubble?.addEventListener('click', toggleChatWindow);
  closeChat?.addEventListener('click', toggleChatWindow);

  sendBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const text = (chatInput?.value || '').trim();
    if (!text) return;
    chatInput.value = '';
    sendMessage(text);
  });

  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = (chatInput?.value || '').trim();
      if (!text) return;
      chatInput.value = '';
      sendMessage(text);
    }
  });

  // Optional: probe function health once per load (non-blocking)
  try {
    fetch('/.netlify/functions/ping')
      .then(r => r.json())
      .then(info => {
        if (info && info.ok === false) {
          console.warn('Chat backend not configured:', info);
        }
      })
      .catch(() => {});
  } catch {}
});
