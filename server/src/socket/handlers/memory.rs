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
                room.start_game(socket.id.to_string()).await;
                let turn = room.get_turn();
                let times = room.get_player_times().await;
                if let Some(turn) = turn {
                    socket
                        .within(room_id.clone())
                        .emit("turn", (turn, times))
                        .unwrap_or_else(|e| error!("Failed to emit turn event: {}", e));
                }
            } else {
                error!("Received flip_tile event for non-playing room {}", room_id);
                return;
            }
        }
        let board = room.get_mut_memory_board();
        if let Some(tile) = board.flip_tile(index) {
            // Tell the opponent that tile is flipped
            socket
                .within(room_id.clone())
                .emit("tile_flipped", (index, tile, socket.id.to_string()))
                .unwrap_or_else(|e| error!("Failed to emit tile_flipped event: {}", e));
            room.increment_turns();
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
        let matched = board.match_tiles();
        if matched.get_matches().len() != 0 {
            socket
                .emit("select_piece", matched.get_tile())
                .unwrap_or_else(|e| error!("Failed to get tile: {}", e));
            socket
                .within(room_id.clone())
                .emit("tiles_matched", (matched, socket.id.to_string()))
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
