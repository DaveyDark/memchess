use socketioxide::extract::{SocketRef, State};
use tracing::error;

use crate::{socket::state::SocketState, util::get_data_from_extension};

pub async fn on_player_info(socket: SocketRef, state: State<SocketState>) {
    // Get room id and check if player is in a room
    let room_id = get_data_from_extension(&socket);
    if room_id.is_empty() {
        socket
            .emit("player_info", "No room")
            .unwrap_or_else(|e| error!("Failed to emit player_info event: {}", e));
        return;
    }
    let room = state.get(room_id.clone()).await;
    if !room.is_some() {
        socket
            .emit("player_info", "Room not found")
            .unwrap_or_else(|e| error!("Failed to emit player_info event: {}", e));
        return;
    }
    let room = room.unwrap();

    // Return player data
    let players = room.get_player_names();
    socket
        .within(room_id)
        .emit(
            "player_info",
            serde_json::json!({
                "player1": players.0,
                "player2": players.1
            }),
        )
        .unwrap_or_else(|e| error!("Failed to emit player_info event: {}", e));
}
