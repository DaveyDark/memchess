# MemChess

MemChess is an interesting combination of the games [Memory](<https://en.wikipedia.org/wiki/Concentration_(card_game)>) and [Chess](https://en.wikipedia.org/wiki/Chess).

It is a small project I took up to learn about websockets using [Socket.IO](https://socket.io/) in [Rust](https://www.rust-lang.org/)

## About the game

- Memchess is a turn based game between two players.

- Two boards are visible on the screen, a memory board and a chess board.

- The chess board represents a normal chess game.

  - The memory board consists of pairs of tiles representing various chess pieces on the board like the Black Knight, the White Bishop and so on.
  - The memory board contains a total of 64 tiles.
  - All pieces except the Kings have 2 matching tiles on the memory board.
  - The remaining 4 tiles are wildcards which can be matched with any card

- During each turn, the player can make 1 move on the memory board, which means being able to flip two tiles, and 1 move on the chess board.

- Taking a move on the memory board is optional and can be skipped by the player if so desired

- The turn ends after the player performs a move on the chess board

- Successfully matching two cards on the memory board removes that piece from the board. For example, matching two cards of the Black Knight will remove the Black Knight from the chess board. Matching a card will give the player points equal to the value of the piece

- The game continues and players keep taking turns until 1 player wins on the chess board or the chess game ends in a draw

- In case of draw, The player who has a higher score on the memory board wins.

- Notes:

  - You can match your own pieces on the memory board but it won't add to your score, however it will delete the piece from the board.

## About the project

This project uses a React app via Vite, written in TypeScript, to serve as the frontend. It is hosted on Vercel.

The backend for the project is a Socket.IO server written in Rust using Socketioxide and axum

## Tech Stack
- Client (TypeScript + React(Vite))
  - react-chessboard (Chessboard Component)
  - socket.io-client (SocketIO Client Events)
  - chess.js (Move Validation)
  - Tailwind CSS (Styling)
  - Daisy UI (Component Library)
- Server (Rust)
  - Axum (Web Server)
  - SocketIOxide (SocketIO Server)
  - Shuttle (Deployment)

## Installation

TODO

## Usage

TODO
