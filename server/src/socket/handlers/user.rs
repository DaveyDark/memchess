use socketioxide::extract::{SocketRef, State};
use tracing::{error, warn};

use crate::{socket::state::SocketState, util::get_data_from_extension};

use super::chess::GameResult;

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
    let players = room.get_players();
    socket
        .within(room_id)
        .emit(
            "player_info",
            serde_json::json!({
                "player1": players.0,
                "player2": players.1,
            }),
        )
        .unwrap_or_else(|e| error!("Failed to emit player_info event: {}", e));
}

pub async fn on_get_player_times(socket: SocketRef, state: State<SocketState>) {
    let room_id = get_data_from_extension(&socket);
    let room = state.get(room_id.clone()).await;
    if !room.is_some() {
        warn!("Room not found for get_player_times");
        return;
    }

    let room = room.unwrap();
    let times = room.get_player_times().await;

    socket
        .within(room_id)
        .emit("player_times", times)
        .unwrap_or_else(|e| error!("Failed to emit player_times event: {}", e));
}

pub async fn on_timeout(socket: SocketRef, state: State<SocketState>) {
    let room_id = get_data_from_extension(&socket);
    let room = state.get(room_id.clone()).await;
    if !room.is_some() {
        warn!("Room not found for get_player_times");
        return;
    }

    let room = room.unwrap();

    // Check if both players have time left
    if !room.timeout().await {
        return;
    }

    let times = room.get_player_times().await;

    // Get player data
    let players = room.get_players();
    // P1 is winner by default
    let p1 = players.0;
    let p2 = players.1;

    if p1.is_none() || p2.is_none() {
        return;
    }

    let mut p1 = p1.unwrap();
    let mut p2 = p2.unwrap();

    // Swap p1 and p2 if p2 has time leff
    if times.1 > 0 {
        std::mem::swap(&mut p1, &mut p2);
    }

    let result = GameResult {
        player1: p1,
        player2: p2,
    };

    socket
        .within(room_id)
        .emit("timeout", result)
        .unwrap_or_else(|e| error!("Failed to emit player_times event: {}", e));
}
