// chat-widget.js

document.addEventListener('DOMContentLoaded', () => {
  const chatBubble = document.getElementById('chat-bubble');
  const chatWindow = document.getElementById('chat-window');
  const closeChat = document.getElementById('close-chat');

  // Function to toggle the chat window's visibility
  const toggleChatWindow = () => {
    chatWindow.classList.toggle('hidden');
  };

  // Event listeners
  chatBubble.addEventListener('click', toggleChatWindow);
  closeChat.addEventListener('click', toggleChatWindow);

  // We will add logic for sending/receiving messages later
});
