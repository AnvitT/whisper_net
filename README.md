# Whisper Net

Whisper Net is a web application that allows users to send and receive anonymous messages. It also features AI-generated suggested messages, a clean user interface, and the ability to accept or decline messages.

## Features

- **Anonymous Messaging**: Users can send and receive messages anonymously.
- **AI-Generated Suggested Messages**: Get message suggestions from AI.
- **Clean UI**: A user-friendly and clean interface.
- **Message Acceptance**: Users can choose to accept or decline messages.

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/AnvitT/whisper_net.git
    cd whisper_net
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables:
    - Create a  file in the root directory.
    - Add the following variables:
        ```env
        NEXTAUTH_SECRET=your-secret
        MONGODB_URI=your-mongodb-uri
        GEMINI_API_KEY=your-gemini-api-key
        EMAIL_USER=your-email
        EMAIL_APP_PASSWORD=your-email-app-password
        ```

4. Run the development server:
    ```sh
    npm run dev
    ```

5. Open your browser and navigate to `http://localhost:3000`.

### Building for Production

To build the project for production, run:
```sh
npm run build
```

### Running in Production

You can access the production version of Whisper Net at the following URL:
[Whisper Net Production](https://whisper-net-peach.vercel.app/)

#### Credits

I learned from this video: [Chai Aur Code](https://www.youtube.com/watch?v=zLJoVRleOuc&pp=ygUNY2hhaSBhdXIgY29kZQ%3D%3D)