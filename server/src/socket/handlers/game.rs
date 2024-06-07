use socketioxide::extract::{SocketRef, State};
use tracing::error;

use crate::{socket::state::SocketState, util::get_data_from_extension};

pub async fn on_reset_game(socket: SocketRef, state: State<SocketState>) {
    // Reset the game state
    let room_id = get_data_from_extension(&socket);
    if let Some(mut room) = state.get(room_id.clone()).await {
        room.reset_game().await;
        state.update(room_id.clone(), room.clone()).await;
        socket
            .within(room_id.clone())
            .emit("game_reset", ())
            .unwrap_or_else(|e| {
                error!("Error sending game_reset event: {:?}", e);
            });
        socket
            .within(room_id.clone())
            .emit("memory_board", room.get_memory_board())
            .unwrap_or_else(|e| {
                error!("Error sending memory_board event: {:?}", e);
            });
    }
}
