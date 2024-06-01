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

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MatchedTiles {
    tile: String,
    matches: Vec<usize>,
}

impl MatchedTiles {
    pub fn new_empty() -> Self {
        Self {
            tile: String::new(),
            matches: vec![],
        }
    }
    pub fn new(tile: String, matches: Vec<usize>) -> Self {
        Self { tile, matches }
    }
    pub fn get_tile(&self) -> &str {
        &self.tile
    }
    pub fn get_matches(&self) -> Vec<usize> {
        self.matches.clone()
    }
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

    pub fn flip_tile(&mut self, index: usize) -> bool {
        // Flips the tile at the given index

        // If 2 tiles are already flipped, do nothing
        // If the tile is already flipped, do nothing
        // If the tile is empty, do nothing
        if self.flips.len() == 2 || self.flips.contains(&index) || self.board[index].is_empty() {
            return false;
        }

        // Add the index to the flips
        self.flips.push(index);
        self.board[index] += "_";
        true
    }

    pub fn match_tiles(&mut self) -> MatchedTiles {
        // Matches the last 2 flipped tiles
        if self.flips.len() != 2 {
            return MatchedTiles::new_empty();
        }
        let t1 = self.board[self.flips[0]].clone();
        let t2 = self.board[self.flips[1]].clone();
        let t1 = t1.trim_matches('_').to_ascii_lowercase();
        let t2 = t2.trim_matches('_').to_ascii_lowercase();
        let mut matches = vec![];
        // Check for wildcards
        if t1 == "x" || t2 == "x" {
            // Wildcard will match any tile
            // Clear both tiles + the actual match of the non-wildcard tile
            let tile_index = if t1 == "x" {
                self.flips[1]
            } else {
                self.flips[0]
            };
            let tile = if t1 == "x" { t2 } else { t1 };
            let matched_tile = self.find_matching_tile(tile_index).unwrap();
            self.board[self.flips[0]] = String::new();
            self.board[self.flips[1]] = String::new();
            self.board[matched_tile] = String::new();
            matches.push(self.flips[0]);
            matches.push(self.flips[1]);
            matches.push(matched_tile);
            self.flips.clear();
            return MatchedTiles::new(tile, matches);
        }

        // Otherwise, check for equality
        if t1 == t2 {
            // If the last 2 flipped tiles match, return true and remove them
            let tile = self.board[self.flips[0]].clone();
            self.board[self.flips[0]] = String::new();
            self.board[self.flips[1]] = String::new();
            matches.push(self.flips[0]);
            matches.push(self.flips[1]);
            self.flips.clear();
            let tile = tile.trim_matches('_').to_string();
            MatchedTiles::new(tile, matches)
        } else {
            // If the last 2 flipped tiles don't match, return false and unflip the tiles
            self.board[self.flips[0]].pop();
            self.board[self.flips[1]].pop();
            self.flips.clear();
            MatchedTiles::new_empty()
        }
    }

    fn find_matching_tile(&self, index: usize) -> Option<usize> {
        // Find the matching tile for the given index
        let tile = self.board[index].trim_matches('_').to_ascii_lowercase();
        let mut matches = vec![];
        for (i, t) in self.board.iter().enumerate() {
            if i != index && t.to_ascii_lowercase().trim_matches('_') == tile {
                matches.push(i);
            }
        }
        // Return a random matching tile
        if matches.is_empty() {
            None
        } else {
            let i = thread_rng().gen_range(0..matches.len());
            Some(matches[i])
        }
    }

    pub fn remove_tiles(&mut self, piece: String) -> Vec<usize> {
        // Find matching tiles
        let mut matches = vec![];
        for (i, tile) in self.board.iter_mut().enumerate() {
            if tile.to_ascii_lowercase().trim_matches('_') == &piece {
                matches.push(i);
            }
        }

        let mut removed = vec![];
        // Remove 2 random matching tiles
        if matches.len() >= 2 {
            let i = thread_rng().gen_range(0..matches.len());
            self.board[matches[i]] = String::new();
            let mut j = i;
            while j == i {
                j = thread_rng().gen_range(0..matches.len());
            }
            self.board[matches[j]] = String::new();
            removed.push(matches[i]);
            removed.push(matches[j]);
        }

        removed
    }

    pub fn get_flips(&self) -> Vec<usize> {
        // Returns the indices of the flipped tiles
        self.flips.clone()
    }
}
