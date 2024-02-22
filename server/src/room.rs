use crate::memory::MemoryBoard;

#[derive(Debug, Clone)]
pub struct Room {
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
        Self {
            p1: p1.clone(),
            p2: String::new(),
            chess_fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR".to_string(),
            memory_str: MemoryBoard::new().serialize(),
            turn: p1.to_string(),
            turn_count: 0,
            playing: false,
        }
    }
    pub fn start_game(&mut self, p2: String) {
        self.p2 = p2;
        self.playing = true;
    }
    pub fn is_playing(&self) -> bool {
        self.playing
    }
}
