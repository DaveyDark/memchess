use socketioxide::extract::{Data, SocketRef, State};
use tracing::error;

use crate::{socket::state::SocketState, util::get_data_from_extension};

pub async fn on_move_piece(
    socket: SocketRef,
    state: State<SocketState>,
    Data::<String>(move_str): Data<String>,
) {
    let room_id = get_data_from_extension(&socket)[1].clone();
    let room = state.get(room_id.clone()).await;

    if room.is_none() {
        error!("Room {} not found", room_id);
        return;
    }

    let mut room = room.unwrap();

    if !room.is_playing() {
        error!("Received move_piece event for non-playing room {}", room_id);
        return;
    }

    let board = match room.get_chess_board() {
        Ok(board) => board,
        Err(_) => {
            error!(
                "Fatal error: Couldn't get chess board from room {}. Chess fen is illegal",
                room_id
            );
            socket
                .to(room_id)
                .emit("reset_game", "Fatal error")
                .unwrap_or_else(|e| error!("Failed to emit reset_game event: {}", e));
            return;
        }
    };

    let chess_move = match chess::ChessMove::from_san(&board, &move_str) {
        Ok(chess_move) => chess_move,
        Err(e) => {
            error!("Invalid move: {} in room {}: {}", move_str, room_id, e);
            socket
                .to(room_id)
                .emit("invalid_move", move_str)
                .unwrap_or_else(|e| error!("Failed to emit invalid_move event: {}", e));
            return;
        }
    };

    if !board.legal(chess_move) {
        error!("Illegal move: {} in room {}", move_str, room_id);
        socket
            .emit("illegal_move", move_str)
            .unwrap_or_else(|e| error!("Failed to emit illegal_move event: {}", e));
        return;
    }

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
        let mut memory_board = room.get_memory_board();
        memory_board.remove_tiles(capture.to_string());
        room.set_memory_board(memory_board);
    }

    let new_board = board.make_move_new(chess_move);
    room.set_chess_board(new_board);

    // Check for game end
    if board.status() == chess::BoardStatus::Stalemate {
        // Stalemate
        socket
            .within(room_id.clone())
            .emit("stalemate", "")
            .unwrap_or_else(|e| error!("Failed to emit stalemate event: {}", e));
        room.end_game();
        state.update(room_id.clone(), room).await;
    } else if board.status() == chess::BoardStatus::Checkmate {
        // Checkmate
        socket
            .within(room_id.clone())
            .emit("checkmate", "")
            .unwrap_or_else(|e| error!("Failed to emit checkmate event: {}", e));
        room.end_game();
        state.update(room_id.clone(), room).await;
    } else {
        state.update(room_id.clone(), room).await;
        // Emit the move to the opponent
        socket
            .emit("piece_moved", move_str)
            .unwrap_or_else(|e| error!("Failed to emit piece_moved event: {}", e));
    }
}
