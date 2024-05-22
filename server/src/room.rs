use std::str::FromStr;

use serde::{Deserialize, Serialize};

use crate::memory::board::MemoryBoard;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Room {
    // Stores all the information about a room
    p1: String,
    p2: String,
    p1_name: String,
    p2_name: String,
    chess_fen: String,
    memory_board: MemoryBoard,
    turn: String,
    turn_count: u32,
    playing: bool,
    white: String,
    black: String,
}

impl Room {
    pub fn new(p1: String, p1_name: String) -> Self {
        // Create a new room with the given id as player 1
        Self {
            p1: p1.clone(),
            p2: String::new(),
            p1_name,
            p2_name: String::new(),
            chess_fen: chess::Board::default().to_string(),
            memory_board: MemoryBoard::new(),
            turn: p1.to_string(),
            turn_count: 0,
            playing: false,
            black: String::new(),
            white: String::new(),
        }
    }
    pub fn connect_player(&mut self, p: String, name: String) {
        // Add player p to the room
        self.p2 = p.clone();
        self.p2_name = name;
    }
    pub fn start_game(&mut self, _p: String) {
        // Starts game with player _p
        self.playing = true;
        if self.p1 == _p {
            self.white = self.p1.clone();
            self.black = self.p2.clone();
        } else {
            self.white = self.p2.clone();
            self.black = self.p1.clone();
        }
        self.turn = _p;
    }
    pub fn disconnect_player(&mut self, p: String) {
        // Remove player p from the room
        if p == self.p1 {
            self.p1 = self.p2.clone();
        }
        self.p2 = String::new();

        // Stop game
        self.playing = false;
    }
    pub fn reset_game(&mut self) {
        // Reset the game to it's initial state
        self.chess_fen = chess::Board::default().to_string();
        self.memory_board = MemoryBoard::new();
        self.turn = self.p1.to_string();
        self.turn_count = 0;
        self.playing = false;
    }
    pub fn is_playing(&self) -> bool {
        // Returns true if the game is currently being played
        self.playing
    }
    pub fn is_empty(&self) -> bool {
        // Returns true if the room is empty
        self.p1 == "" && self.p2 == ""
    }
    pub fn get_turn(&self) -> String {
        // Returns the player whose turn it is
        self.turn.clone()
    }
    pub fn switch_turn(&mut self) {
        // Switches the turn to the other player
        if self.turn == self.p1 {
            self.turn = self.p2.clone();
        } else {
            self.turn = self.p1.clone();
        }
        self.turn_count += 1;
    }
    pub fn get_mut_memory_board(&mut self) -> &mut MemoryBoard {
        // Returns a mutable reference to the memory board
        &mut self.memory_board
    }
    pub fn get_memory_board(&self) -> MemoryBoard {
        // Returns the memory board
        self.memory_board.clone()
    }
    pub fn set_memory_board(&mut self, board: MemoryBoard) {
        // Sets the memory board
        self.memory_board = board;
    }
    pub fn get_chess_board(&self) -> Result<chess::Board, chess::Error> {
        // Returns the chess board as a string
        chess::Board::from_str(&self.chess_fen)
    }
    pub fn set_chess_board(&mut self, board: chess::Board) {
        // Sets the chess board from a string
        self.chess_fen = board.to_string();
    }
    pub fn get_player_names(&self) -> (String, String) {
        // Returns the names of the players
        (self.p1_name.clone(), self.p2_name.clone())
    }
    pub fn end_game(&mut self) {
        // Ends the game
        self.playing = false;
    }
    pub fn get_white(&self) -> String {
        // Returns the white player
        self.white.clone()
    }
    pub fn get_white_name(&self) -> String {
        // Returns the name of the white player
        if self.white == self.p1 {
            self.p1_name.clone()
        } else {
            self.p2_name.clone()
        }
    }
    pub fn get_black(&self) -> String {
        // Returns the black player
        self.black.clone()
    }
    pub fn get_black_name(&self) -> String {
        // Returns the name of the black player
        if self.black == self.p1 {
            self.p1_name.clone()
        } else {
            self.p2_name.clone()
        }
    }
}
