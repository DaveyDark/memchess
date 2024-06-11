use chess::{BoardStatus, Color};
use tracing::error;

use crate::{room::Room, user::User};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct Move {
    pub from: String,
    pub to: String,
    pub promotion: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct GameResult {
    pub player1: User,
    pub player2: User,
    pub result: String,
}

pub fn is_game_over(board: &chess::Board, room: &Room) -> Option<GameResult> {
    if let Some(winner) = room.check_win() {
        let (p1, p2) = room.get_players();
        let p1 = p1.unwrap();
        let p2 = p2.unwrap();

        let winner = match winner {
            Color::White => "White",
            Color::Black => "Black",
        };

        Some(if p1.get_chess_color() == winner {
            GameResult {
                player1: p1,
                player2: p2,
                result: "game_over".to_string(),
            }
        } else {
            GameResult {
                player1: p2,
                player2: p1,
                result: "game_over".to_string(),
            }
        })
    } else if board.status() == BoardStatus::Checkmate {
        // Checkmate
        let white = room.get_white();
        let black = room.get_black();
        if white.is_none() || black.is_none() {
            error!("Game over but missing player");
            return None;
        }
        let white = white.unwrap();
        let black = black.unwrap();
        Some(match board.side_to_move() {
            chess::Color::White => GameResult {
                player1: black,
                player2: white,
                result: "checkmate".to_string(),
            },
            chess::Color::Black => GameResult {
                player1: white,
                player2: black,
                result: "checkmate".to_string(),
            },
        })
    } else if board.status() == BoardStatus::Stalemate {
        // Stalemate
        let (p1, p2) = room.get_players();
        let p1 = p1.unwrap();
        let p2 = p2.unwrap();
        Some(GameResult {
            player1: p1,
            player2: p2,
            result: "stalemate".to_string(),
        })
    } else {
        None
    }
}
