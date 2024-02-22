use crate::memory::board::MemoryBoard;

#[derive(Debug, Clone)]
pub struct Room {
    // Stores all the information about a room
    p1: String,
    p2: String,
    chess_fen: String,
    memory_str: String,
    turn: String,
    turn_count: u32,
    playing: bool,
}

impl Room {
    pub fn new(p1: String) -> Self {
        // Create a new room with the given id as player 1
        Self {
            p1: p1.clone(),
            p2: String::new(),
            chess_fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".to_string(),
            memory_str: MemoryBoard::new().serialize(),
            turn: p1.to_string(),
            turn_count: 0,
            playing: false,
        }
    }
    pub fn connect_player(&mut self, p: String) {
        // Add player p to the room
        self.p2 = p.clone();
    }
    pub fn start_game(&mut self) {
        // Adds the second player to the room and starts the game
        self.playing = true;
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
        self.chess_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".to_string();
        self.memory_str = MemoryBoard::new().serialize();
        self.turn = self.p1.to_string();
        self.turn_count = 0;
        self.playing = false;
    }
    pub fn is_playing(&self) -> bool {
        // Returns true if the game is currently being played
        self.playing
    }
}
