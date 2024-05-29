# Reemad Chatroom Application

Reemad Chatroom is a real-time chat application designed for internal communication within ReemadChemicals.Inc. The application supports user authentication, message history, and real-time message updates.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)

## Description

The Reemad Chatroom application allows authenticated users to communicate in real-time. The application stores chat history and displays it upon reconnection. It's built with modern web technologies to ensure a seamless and responsive user experience.

## Features

- User authentication
- Real-time messaging
- Chat history
- User typing feedback
- Responsive design


### Backend

- Node.js
- Express.js
- MongoDB
- Passport.js for authentication

### Frontend

- HTML/CSS
- JavaScript
- Socket.IO


## Installation

To set up the project locally, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Khaoulaad/portfolio-project.git
    cd yourrepository
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root directory and add the following environment variables:

    ```plaintext
    SESSION_SECRET=your_session_secret
    MONGO_URI=your_mongo_database_uri
    PORT=4000
    ```

4. **Run the application:**

    ```bash
    node app.js
    ```

5. **Access the application:**

    Open your web browser and navigate to `http://localhost:4000`.

## Usage

1. **Login:**

    localhost:4000 (`/login`) and enter your credentials.

2. **Chat:**

    Once logged in, you can start sending messages in the chatroom. Your messages will appear on the right, while messages from other users will appear on the left.

3. **View Chat History:**

    Upon reconnection, previous messages will be displayed in the chat history.

---

Thank you for using Reemad Chatroom!

