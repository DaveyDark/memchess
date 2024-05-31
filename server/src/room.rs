use std::str::FromStr;

use serde::{Deserialize, Serialize};

use crate::{memory::board::MemoryBoard, user::User};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RoomState {
    Waiting,
    Ready,
    Playing,
    Over,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Room {
    // Stores all the information about a room
    p1: Option<User>,
    p2: Option<User>,
    chess_fen: String,
    memory_board: MemoryBoard,
    turn: String,
    turn_count: u32,
    state: RoomState,
}

impl Room {
    pub fn new(
        id: String,
        name: String,
        avatar: String,
        avatar_orientation: u8,
        avatar_color: String,
    ) -> Self {
        let p1 = User::new(
            id,
            name,
            avatar,
            avatar_orientation,
            avatar_color,
            String::new(),
        );

        // Create a new room with the given id as player 1
        Self {
            p1: Some(p1),
            p2: None,
            chess_fen: chess::Board::default().to_string(),
            memory_board: MemoryBoard::new(),
            turn: String::new(),
            turn_count: 0,
            state: RoomState::Waiting,
        }
    }
    pub fn connect_player(
        &mut self,
        p: String,
        name: String,
        avatar: String,
        avatar_orientation: u8,
        avatar_color: String,
    ) {
        // Add player p to the room
        self.reset_game();
        self.p2 = Some(User::new(
            p,
            name,
            avatar,
            avatar_orientation,
            avatar_color,
            String::new(),
        ));
        self.state = RoomState::Ready;
    }
    pub fn start_game(&mut self, _p: String) {
        // Starts game with player _p
        self.state = RoomState::Playing;
        if self.p1.is_none() || self.p2.is_none() {
            return;
        }
        let p1 = self.p1.as_mut().unwrap();
        let p2 = self.p2.as_mut().unwrap();
        if p1.get_id() == _p {
            p1.set_chess_color("white".to_string());
            p2.set_chess_color("black".to_string());
        } else {
            p1.set_chess_color("black".to_string());
            p2.set_chess_color("white".to_string());
        }
        self.turn = _p;
    }
    pub fn disconnect_player(&mut self, p: String) {
        // Remove player p from the room
        if p == self.p1.as_ref().unwrap().get_id() {
            self.p1 = self.p2.clone();
        }
        self.p2 = None;
        // Stop game
        self.state = RoomState::Waiting;
    }
    pub fn reset_game(&mut self) {
        // Reset the game to it's initial state
        self.chess_fen = chess::Board::default().to_string();
        self.memory_board = MemoryBoard::new();
        self.turn = String::new();
        self.turn_count = 0;
        self.state = RoomState::Ready;
    }
    pub fn get_state(&self) -> RoomState {
        // Returns the state of the room
        self.state.clone()
    }
    pub fn player_count(&self) -> u32 {
        // Returns the number of players in the room
        let mut count = 0;
        if self.p1.is_some() {
            count += 1;
        }
        if self.p2.is_some() {
            count += 1;
        }
        count
    }
    pub fn get_turn(&self) -> String {
        // Returns the player whose turn it is
        self.turn.clone()
    }
    pub fn switch_turn(&mut self) {
        // Switches the turn to the other player
        if self.state != RoomState::Playing {
            return;
        }
        let p1 = self.p1.as_ref().unwrap();
        let p2 = self.p2.as_ref().unwrap();
        if self.turn == p1.get_id() {
            self.turn = p2.get_id();
        } else {
            self.turn = p1.get_id();
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
    pub fn get_players(&self) -> (Option<User>, Option<User>) {
        // Returns the players
        (self.p1.clone(), self.p2.clone())
    }
    pub fn end_game(&mut self) {
        // Ends the game
        self.state = RoomState::Over;
    }
    pub fn get_white(&self) -> Option<User> {
        // Returns the white player
        if self.player_count() != 2 {
            return None;
        }
        let p1 = self.p1.as_ref().unwrap();
        let p2 = self.p2.as_ref().unwrap();
        if p1.get_chess_color() == "white" {
            Some(p1.clone())
        } else {
            Some(p2.clone())
        }
    }
    pub fn get_black(&self) -> Option<User> {
        // Returns the black player
        if self.player_count() != 2 {
            return None;
        }
        let p1 = self.p1.as_ref().unwrap();
        let p2 = self.p2.as_ref().unwrap();
        if p1.get_chess_color() == "black" {
            Some(p1.clone())
        } else {
            Some(p2.clone())
        }
    }
}
