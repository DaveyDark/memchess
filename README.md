# MemChess
![](https://i.imgur.com/HmGoqxr.png)

MemChess is an interesting combination of the games [Memory](<https://en.wikipedia.org/wiki/Concentration_(card_game)>) and [Chess](https://en.wikipedia.org/wiki/Chess).

It is a small project I took up to learn about websockets using [Socket.IO](https://socket.io/) in [Rust](https://www.rust-lang.org/)

## About the game

### Rules
- Memchess is a two-player turn-based game.
- It combines a game of Chess with an 8x8 Memory game, played simultaneously.
- Each turn consists of a Chess move and an optional Memory move. The turn ends after the Chess move.
- Each Chess piece has a corresponding pair of cards on the Memory board, except for the King. When a piece is captured, its corresponding cards are removed. When a piece is promoted, its corresponding cards change.
- Matching a pair of cards on the Memory board allows the player to optionally remove the corresponding piece on the Chess board, as long as it does not break Chess rules.
- The Memory board contains four wildcards. Wildcards can match with any card. Matching two wildcards allows the player to remove any piece from the board, except the King.

### Winning the Game
The game ends when one of the following conditions is met:
- A checkmate occurs.
- A stalemate occurs, resulting in a draw.
- All pieces of one player, except the King, are eliminated. The other player is declared the winner.
- In timed mode, if a player runs out of time, the other player is declared the winner.

### Tips
- If you know the locations of a pair of cards of your color, you can match them without removing a piece to gain an advantage, essentially removing the cards for one of your pieces.
- Strategically match cards to remove an opposing piece that is pinning one of your pieces.
- You can skip the Memory move to let your opponent reveal cards, which might be advantageous for you.

## About the project

This project uses a React app via Vite, written in TypeScript, to serve as the frontend. It is hosted on Vercel.

The backend for the project is a Socket.IO server written in Rust using Socketioxide and axum

## Tech Stack
- Client (TypeScript + React(Vite))
  - react-chessboard (Chessboard Component)
  - socket.io-client (SocketIO Client Events)
  - chess.js (Move Validation)
  - Howler (SFX)
  - Tailwind CSS (Styling)
  - Daisy UI (Component Library)
- Server (Rust)
  - Axum (Web Server)
  - SocketIOxide (SocketIO Server)
  - Shuttle (Deployment)
  - chess.rs (Move Validation and Board Management)

## Installation

To set up the project locally, follow these steps:

### Prerequisites

- Node.js and npm installed. You can download them from Node.js official website.
- Rust installed. You can download it from Rust official website.

### Steps

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/memchess.git
    cd memchess
    ```

2. Set up the server:
    ```sh
    cd server
    cargo build
    cargo shuttle run
    ```

3. Create the .env.local file inside /client and set the VITE_SERVER_URL variable to the server url(by default 127.0.0.1)
    ```
    VITE_SERVER_URL=127.0.0.1
    ```

4. Set up the client:
    ```sh
    cd client
    npm install
    npm run dev
    ```

### Running the project:

Ensure the client and server are both running. The client should be accessible at http://localhost:5173 and the server at http://localhost:8000.

## Usage

To play MemChess:
1. Open the client in your browser at http://localhost:5173.
2. Set your avatar adn create a room.
3. Copy and send the code to a friend to join.
4. Make your Chess and Memory moves according to the game rules outlined above.
5. Enjoy the game!