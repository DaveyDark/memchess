use std::str::FromStr;

use chess::Square;
use socketioxide::extract::{Data, SocketRef, State};
use tracing::error;

use crate::{socket::state::SocketState, util::get_data_from_extension};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct Move {
    from: String,
    to: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct GameResult {
    winner: String,
    winner_name: String,
    loser: String,
    loser_name: String,
}

pub async fn on_move_piece(
    socket: SocketRef,
    state: State<SocketState>,
    Data::<Move>(_move): Data<Move>,
) {
    let room_id = get_data_from_extension(&socket);
    // Get room
    let room = state.get(room_id.clone()).await;

    // Return if no room is found
    if room.is_none() {
        error!("Room {} not found", room_id);
        return;
    }
    let mut room = room.unwrap();

    // If room is inactive
    if !room.is_playing() {
        room.start_game(socket.id.clone().to_string());
    }

    // Get Game Board
    let board = match room.get_chess_board() {
        Ok(board) => board,
        Err(_) => {
            // Emit Error if chess fen is illegal/corrupt
            socket
                .to(room_id)
                .emit("illegal_fen", "Fatal error")
                .unwrap_or_else(|e| error!("Failed to emit illegal_fen event: {}", e));
            return;
        }
    };

    // Parse given move
    let from = Square::from_str(&_move.from);
    let to = Square::from_str(&_move.to);
    if from.is_err() || to.is_err() {
        // Emit error if move is invalid
        error!("Invalid move: {:?} in room {}", _move, room_id);
        socket
            .to(room_id)
            .emit("invalid_move", "")
            .unwrap_or_else(|e| error!("Failed to emit invalid_move event: {}", e));
        return;
    }
    let from = from.unwrap();
    let to = to.unwrap();

    let chess_move = chess::ChessMove::new(from, to, None);

    // Check if move is legal
    if !board.legal(chess_move) {
        error!("Illegal move: {:?} in room {}", chess_move, room_id);
        socket
            .emit("illegal_move", _move)
            .unwrap_or_else(|e| error!("Failed to emit illegal_move event: {}", e));
        return;
    }

    // Check if the move is a capture
    let dest = chess_move.get_dest();
    if let Some(piece) = board.piece_on(dest) {
        // Capture
        let color = board.color_on(dest).unwrap();
        let capture = match piece.to_string(color).as_str() {
            "p" => "bp",
            "q" => "bq",
            "r" => "br",
            "b" => "bb",
            "n" => "bn",
            "k" => "bk",
            "P" => "wp",
            "Q" => "wq",
            "R" => "wr",
            "B" => "wb",
            "N" => "wn",
            "K" => "wk",
            _ => "",
        };
        // Remove corresponding piece from memory board
        let mut memory_board = room.get_memory_board();
        memory_board.remove_tiles(capture.to_string());
        room.set_memory_board(memory_board);
    }

    // Set the new board
    let new_board = board.make_move_new(chess_move);
    room.set_chess_board(new_board);

    // Check for game end
    if new_board.status() == chess::BoardStatus::Stalemate {
        // Stalemate
        socket
            .within(room_id.clone())
            .emit("stalemate", "")
            .unwrap_or_else(|e| error!("Failed to emit stalemate event: {}", e));
        room.end_game();
        state.update(room_id.clone(), room).await;
    } else if new_board.status() == chess::BoardStatus::Checkmate {
        // Checkmate
        let winner = match new_board.side_to_move() {
            chess::Color::Black => GameResult {
                winner: room.get_white(),
                winner_name: room.get_white_name(),
                loser: room.get_black(),
                loser_name: room.get_black_name(),
            },
            chess::Color::White => GameResult {
                winner: room.get_black(),
                winner_name: room.get_black_name(),
                loser: room.get_white(),
                loser_name: room.get_white_name(),
            },
        };
        socket
            .within(room_id.clone())
            .emit("checkmate", winner)
            .unwrap_or_else(|e| error!("Failed to emit checkmate event: {}", e));
        room.end_game();
        state.update(room_id.clone(), room).await;
    } else {
        room.switch_turn();
        state.update(room_id.clone(), room.clone()).await;
        // Emit the move to the opponent
        socket
            .to(room_id.clone())
            .emit("piece_moved", _move)
            .unwrap_or_else(|e| error!("Failed to emit piece_moved event: {}", e));
        // Emit turn event
        socket
            .within(room_id.clone())
            .emit("turn", room.get_turn())
            .unwrap_or_else(|e| error!("Failed to emit turn event: {}", e));
    }
}
