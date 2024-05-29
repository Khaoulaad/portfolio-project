const socket = io();

const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Fetch the username from the server
let currentUsername = ''; // ** New: Added variable to store current username **

fetch('/username')
  .then(response => response.json())
  .then(data => {
    currentUsername = data.username; // ** New: Set currentUsername **
    document.getElementById('name-input').value = data.username;
  })
  .catch(error => console.error('Error fetching username:', error));

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

// Handle chat history
socket.on('chat-history', (messages) => {
  messages.forEach(message => addMessageToUI(currentUsername === message.user, message)); // ** Modified: Check if the message is from the current user **);
});

function sendMessage() {
  if (messageInput.value === '') return;
  const data = {
    user: currentUsername,
    text: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit('message', data);
  addMessageToUI(true, data);
  messageInput.value = '';
}

socket.on('chat-message', (data) => {
  addMessageToUI(currentUsername === data.user, data); // ** Modified: Check if the message is from the current user **
});

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${data.text}
            <span>${data.user} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `;
  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

messageInput.addEventListener('focus', () => {
  socket.emit('feedback', {
    feedback: `✍️ ${currentUsername} is typing a message`,
  });
});

messageInput.addEventListener('keypress', () => {
  socket.emit('feedback', {
    feedback: `✍️ ${currentUsername} is typing a message`,
  });
});
messageInput.addEventListener('blur', () => {
  socket.emit('feedback', {
    feedback: '',
  });
});

socket.on('feedback', (data) => {
  clearFeedback();
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `;
  messageContainer.innerHTML += element;
});

function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element);
  });
}

