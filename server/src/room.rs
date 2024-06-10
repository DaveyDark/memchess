use std::str::FromStr;

use chess::Color;
use serde::{Deserialize, Serialize};

use crate::{memory::board::MemoryBoard, user::User};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RoomState {
    Waiting,
    Ready,
    Playing,
    Over,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RoomType {
    Casual,
    Timed(u64),
}

impl ToString for RoomType {
    fn to_string(&self) -> String {
        match self {
            RoomType::Casual => "casual".to_string(),
            RoomType::Timed(_) => "timed".to_string(),
        }
    }
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
    room_type: RoomType,
}

impl Room {
    pub fn new(
        id: String,
        name: String,
        avatar: String,
        avatar_orientation: u8,
        avatar_color: String,
        room_type: RoomType,
    ) -> Self {
        let time = if let RoomType::Timed(t) = room_type {
            t
        } else {
            0
        };
        let p1 = User::new(
            id,
            name,
            avatar,
            avatar_orientation,
            avatar_color,
            String::new(),
            time,
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
            room_type,
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
        let time = self.get_time();

        let p1 = self.p1.as_mut().unwrap();
        let mut old_id = String::new();

        // Check if the player matches p1 and is trying to reconnect
        if p1.matches(&name, &avatar, &avatar_orientation, &avatar_color) && !p1.is_connected() {
            old_id = p1.get_id();
            p1.reconnect(p.clone());
        } else if self.p2.is_none() {
            // If p2 is empty, add the player as p2
            self.p2 = Some(User::new(
                p.clone(),
                name.clone(),
                avatar.clone(),
                avatar_orientation,
                avatar_color.clone(),
                String::new(),
                time,
            ));
        } else {
            // If p2 is not empty, check if the player is trying to reconnect as p2
            let p2 = self.p2.as_mut().unwrap();

            if !p2.is_connected() && p2.matches(&name, &avatar, &avatar_orientation, &avatar_color)
            {
                old_id = p2.get_id();
                p2.reconnect(p.clone());
            } else {
                // Determine which player slot to reassign based on connection status
                if p1.is_connected() {
                    // If p1 is connected, reassign p2
                    old_id = p2.get_id();
                    self.p2 = Some(User::new(
                        p.clone(),
                        name.clone(),
                        avatar.clone(),
                        avatar_orientation,
                        avatar_color.clone(),
                        String::new(),
                        time,
                    ));
                } else {
                    // If p1 is not connected, reassign p1
                    old_id = p1.get_id();
                    self.p1 = Some(User::new(
                        p.clone(),
                        name.clone(),
                        avatar.clone(),
                        avatar_orientation,
                        avatar_color.clone(),
                        String::new(),
                        time,
                    ));
                }
            }
        }

        // Set room state based on the number of connected players
        if self.player_count() == 1 {
            return;
        }

        if self.turn == old_id {
            self.turn = p;
        }

        if self.turn_count == 0 {
            self.state = RoomState::Ready;
        } else {
            self.state = RoomState::Playing;
        }
    }
    pub async fn start_game(&mut self, _p: String) {
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
            p1.start_turn().await;
        } else {
            p1.set_chess_color("black".to_string());
            p2.set_chess_color("white".to_string());
            p2.start_turn().await;
        }
        self.turn = _p;
    }
    pub fn disconnect_player(&mut self, p: String) {
        // Remove player p from the room
        if p == self.p1.as_ref().unwrap().get_id() {
            self.p1.as_mut().unwrap().disconnect();
        } else {
            self.p2.as_mut().unwrap().disconnect();
        }
        // Stop game
        self.state = RoomState::Waiting;
    }
    pub async fn reset_game(&mut self) {
        // Reset the game to it's initial state
        self.chess_fen = chess::Board::default().to_string();
        self.memory_board = MemoryBoard::new();
        self.turn = String::new();
        self.turn_count = 0;
        self.state = RoomState::Ready;

        // Reset player times
        if self.room_type == RoomType::Casual {
            return;
        }
        let time = self.get_time();
        let p1 = self.p1.as_mut().unwrap();
        let p2 = self.p2.as_mut().unwrap();
        p1.reset_time(time).await;
        p2.reset_time(time).await;
    }
    pub fn get_state(&self) -> RoomState {
        // Returns the state of the room
        self.state.clone()
    }
    pub fn player_count(&self) -> u32 {
        // Returns the number of players in the room
        let mut count = 0;
        if self.p1.is_some() && self.p1.as_ref().unwrap().is_connected() {
            count += 1;
        }
        if self.p2.is_some() && self.p2.as_ref().unwrap().is_connected() {
            count += 1;
        }
        count
    }
    pub fn get_turn(&self) -> Option<String> {
        // Returns the player whose turn it is
        if self.turn != String::new() {
            Some(self.turn.clone())
        } else {
            None
        }
    }
    pub async fn switch_turn(&mut self) {
        // Switches the turn to the other player
        if self.state != RoomState::Playing {
            return;
        }
        let p1 = self.p1.as_mut().unwrap();
        let p2 = self.p2.as_mut().unwrap();
        if self.turn == p1.get_id() {
            p1.end_turn().await;
            self.turn = p2.get_id();
            p2.start_turn().await;
        } else {
            p2.end_turn().await;
            self.turn = p1.get_id();
            p1.start_turn().await;
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
    pub fn increment_turns(&mut self) {
        // Increments the turn count
        self.turn_count += 1;
    }
    pub fn get_time(&self) -> u64 {
        if let RoomType::Timed(t) = self.room_type {
            t
        } else {
            0
        }
    }
    pub async fn get_player_times(&self) -> (u64, u64) {
        // Returns the time for both players
        let p1 = self.p1.as_ref();
        let p2 = self.p2.as_ref();
        let p1_time = if p1.is_some() {
            p1.unwrap().get_time().await
        } else {
            0
        };
        let p2_time = if p2.is_some() {
            p2.unwrap().get_time().await
        } else {
            0
        };
        (p1_time, p2_time)
    }
    pub fn get_type(&self) -> RoomType {
        // Returns the room type
        self.room_type.clone()
    }
    pub async fn timeout(&self) -> bool {
        // Returns true if a player has run out of time
        let p1 = self.p1.as_ref();
        let p2 = self.p2.as_ref();
        if p1.is_none() || p2.is_none() || self.room_type == RoomType::Casual {
            return false;
        }
        let p1_time = if p1.is_some() {
            p1.unwrap().get_time().await
        } else {
            0
        };
        let p2_time = if p2.is_some() {
            p2.unwrap().get_time().await
        } else {
            0
        };
        p1_time == 0 || p2_time == 0
    }

    pub fn check_win(&self) -> Option<Color> {
        // If one of the players only has a king left, the other player wins

        let board = self.get_chess_board().unwrap();
        let mut white = 0;
        let mut black = 0;
        for sq in *board.combined() {
            if board.color_on(sq).unwrap() == Color::White {
                white += 1;
            } else {
                black += 1;
            }
        }
        if white == 1 {
            return Some(Color::Black);
        } else if black == 1 {
            return Some(Color::White);
        } else {
            return None;
        }
    }
}
