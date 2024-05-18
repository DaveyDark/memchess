use socketioxide::extract::{Data, SocketRef, State};
use tracing::error;

use crate::{socket::state::SocketState, util::get_data_from_extension};

pub async fn on_move_piece(
    socket: SocketRef,
    state: State<SocketState>,
    Data::<String>(move_str): Data<String>,
) {
    let room_id = get_data_from_extension(&socket)[1].clone();
    if let Some(mut room) = state.get(room_id.clone()).await {
        if !room.is_playing() {
            error!("Received move_piece event for non-playing room {}", room_id);
            return;
        }
        if let Ok(board) = room.get_chess_board() {
            let chess_move = chess::ChessMove::from_san(&board, &move_str);
            let chess_move = match chess_move {
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
            if board.legal(chess_move) {
                let new_board = board.make_move_new(chess_move);
                room.set_chess_board(new_board);
                state.update(room_id.clone(), room).await;
                // Emit the move to the opponent
                socket
                    .emit("piece_moved", move_str)
                    .unwrap_or_else(|e| error!("Failed to emit piece_moved event: {}", e));
            } else {
                error!("Illegal move: {} in room {}", move_str, room_id);
                socket
                    .emit("illegal_move", move_str)
                    .unwrap_or_else(|e| error!("Failed to emit illegal_move event: {}", e));
            }
        } else {
            error!(
                "Fatal error: Couldn't get chess board from room {}. Chess fen is illegal",
                room_id
            );
            socket
                .to(room_id)
                .emit("reset_game", "Fatal error")
                .unwrap_or_else(|e| error!("Failed to emit reset_game event: {}", e));
        }
    }
}
