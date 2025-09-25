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

  function sendMessage(text) {
    appendMessage(text, 'sent');
    const to = 'yusiyao@vt.edu';
    const subject = encodeURIComponent('Club Tennis Website Inquiry');
    const body = encodeURIComponent(`Hello,\n\n${text}\n\n— Sent from VT Club Tennis site`);
    const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
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

  // Email-based flow; no backend probe
});
