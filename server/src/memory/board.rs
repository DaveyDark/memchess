use rand::{thread_rng, Rng};

// Struct to hold the memory board
pub struct MemoryBoard {
    board: Vec<String>,
}

impl MemoryBoard {
    pub fn new() -> Self {
        // Creates a new board

        // Available tiles, 60 of them represent chess pieces, 4 are for wildcards
        // x is a wildcard, w is white, b is black
        // q is queen, r is rook, b is bishop, n is knight, p is pawn
        // small letters represent first tile and capital letters represent it's matching second tile
        // _ at the end means the tile has been flipped
        const TILES: [&str; 64] = [
            "x", "bq", "br", "br", "bb", "bb", "bn", "bn", "bp", "bp", "bp", "bp", "bp", "bp",
            "bp", "bp", "x", "wq", "wr", "wr", "wb", "wb", "wn", "wn", "wp", "wp", "wp", "wp",
            "wp", "wp", "wp", "wp", "X", "BQ", "BR", "BR", "BB", "BB", "BN", "BN", "BP", "BP",
            "BP", "BP", "BP", "BP", "BP", "BP", "X", "WQ", "WR", "WR", "WB", "WB", "WN", "WN",
            "WP", "WP", "WP", "WP", "WP", "WP", "WP", "WP",
        ];

        // Add tiles from the above array to the board
        let mut game_board = TILES.clone().to_vec();
        // Shuffle the board
        for i in 0..62 {
            let j = thread_rng().gen_range((i + 1)..64);
            game_board.swap(i, j);
        }

        Self {
            board: game_board.into_iter().map(|s| s.to_string()).collect(),
        }
    }

    pub fn from_serialized(serialized: String) -> Self {
        // Returns a new board constructed from a serialized string
        Self {
            board: serialized.split(',').map(|s| s.to_string()).collect(),
        }
    }

    pub fn serialize(&self) -> String {
        // Serializes the board into a string to make it easier to transmit over sockets
        self.board.join(",")
    }
}
