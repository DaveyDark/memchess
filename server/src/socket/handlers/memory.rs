use socketioxide::extract::{Data, SocketRef, State};
use tracing::error;

use crate::{room::RoomState, socket::state::SocketState, util::get_data_from_extension};

pub async fn on_flip_tile(
    socket: SocketRef,
    state: State<SocketState>,
    Data::<usize>(index): Data<usize>,
) {
    let room_id = get_data_from_extension(&socket);
    // Get write access to the room
    if let Some(room) = state.rooms.write().await.get_mut(&room_id) {
        if room.get_state() != RoomState::Playing {
            if room.get_state() == RoomState::Ready {
                room.start_game(socket.id.to_string());
                socket
                    .within(room_id.clone())
                    .emit("turn", room.get_turn())
                    .unwrap_or_else(|e| error!("Failed to emit turn event: {}", e));
            } else {
                error!("Received flip_tile event for non-playing room {}", room_id);
                return;
            }
        }
        let board = room.get_mut_memory_board();
        if board.flip_tile(index) {
            // Tell the opponent that tile is flipped
            socket
                .within(room_id.clone())
                .emit("tile_flipped", index)
                .unwrap_or_else(|e| error!("Failed to emit tile_flipped event: {}", e));
        }
    }
}

pub async fn on_match_tiles(socket: SocketRef, state: State<SocketState>) {
    let room_id = get_data_from_extension(&socket);
    // Get write access to the room
    if let Some(room) = state.rooms.write().await.get_mut(&room_id) {
        if room.get_state() != RoomState::Playing {
            error!(
                "Received match_tiles event for non-playing room {}",
                room_id
            );
            return;
        }
        let board = room.get_mut_memory_board();
        let tiles = board.get_flips();
        if board.match_tiles() {
            socket
                .within(room_id.clone())
                .emit("tiles_matched", tiles)
                .unwrap_or_else(|e| error!("Failed to emit tiles_matched event: {}", e));
        } else {
            socket
                .within(room_id.clone())
                .emit("unflip_tiles", tiles)
                .unwrap_or_else(|e| error!("Failed to emit unflip_tiles event: {}", e));
        }
    }
}

pub async fn on_get_memory_board(socket: SocketRef, state: State<SocketState>) {
    let room_id = get_data_from_extension(&socket);
    // Get read access to the room
    if let Some(room) = state.rooms.read().await.get(&room_id) {
        let board = room.get_memory_board();
        socket
            .emit("memory_board", board)
            .unwrap_or_else(|e| error!("Failed to emit memory_board event: {}", e));
    }
}
