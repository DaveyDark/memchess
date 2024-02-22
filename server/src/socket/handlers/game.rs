use socketioxide::extract::{SocketRef, State};
use tracing::error;

use crate::{socket::state::SocketState, util::get_data_from_extension};

pub async fn on_start_game(socket: SocketRef, state: State<SocketState>) {
    // Start the game
    let room_id = get_data_from_extension(&socket)[1].clone();
    if let Some(mut room) = state.get(room_id.clone()).await {
        room.start_game();
        state.update(room_id.clone(), room).await;
        socket
            .within(room_id.clone())
            .emit("game_started", ())
            .unwrap_or_else(|e| {
                error!("Error sending game_started event: {:?}", e);
            });
    } else {
        error!(
            "Received start_game event for non-existent room {}",
            room_id
        );
    }
}

pub async fn on_reset_game(socket: SocketRef, state: State<SocketState>) {
    // Reset the game state
    let room_id = get_data_from_extension(&socket)[1].clone();
    if let Some(mut room) = state.get(room_id.clone()).await {
        room.reset_game();
        state.update(room_id.clone(), room).await;
        socket
            .within(room_id.clone())
            .emit("game_reset", ())
            .unwrap_or_else(|e| {
                error!("Error sending game_reset event: {:?}", e);
            });
    }
}
