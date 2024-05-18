use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};

// Struct to hold the memory board
// board is a vector of strings, each string represents a tile on the board
// flips stores the last 2 flipped tiles, for matching or unfilpping
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryBoard {
    board: Vec<String>,
    flips: Vec<usize>,
}

impl MemoryBoard {
    pub fn new() -> Self {
        // Creates a new board

        // Available tiles, 60 of them represent chess pieces, 4 are for wildcards
        // x is a wildcard, w is white, b is black
        // q is queen, r is rook, b is bishop, n is knight, p is pawn
        // small letters represent first tile and capital letters represent it's matching second tile
        // _ at the end means the tile has been flipped
        // matched tiles will become empty strings
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
            flips: vec![],
        }
    }

    pub fn flip_tile(&mut self, index: usize) {
        // Flips the tile at the given index

        // If 2 tiles are already flipped, do nothing
        // If the tile is already flipped, do nothing
        // If the tile is empty, do nothing
        if self.flips.len() == 2 || self.flips.contains(&index) || self.board[index].is_empty() {
            return;
        }

        // Add the index to the flips
        self.flips.push(index);
        self.board[index] += "_";
    }

    pub fn match_tiles(&mut self) -> bool {
        // Matches the last 2 flipped tiles
        if self.flips.len() != 2 {
            return false;
        }
        if self.board[self.flips[0]] == self.board[self.flips[1]] {
            // If the last 2 flipped tiles match, return true and remove them
            self.board[self.flips[0]] = String::new();
            self.board[self.flips[1]] = String::new();
            self.flips.clear();
            true
        } else {
            // If the last 2 flipped tiles don't match, return false and unflip the tiles
            self.board[self.flips[0]].pop();
            self.board[self.flips[1]].pop();
            self.flips.clear();
            false
        }
    }

    pub fn get_flips(&self) -> Vec<usize> {
        // Returns the indices of the flipped tiles
        self.flips.clone()
    }
}
