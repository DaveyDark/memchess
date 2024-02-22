use socketioxide::extract::{SocketRef, State};
use tracing::{error, info};

use crate::{socket::state::SocketState, util::get_data_from_extension};

pub mod debug;
pub mod game;
pub mod room;

pub fn on_disconnect(socket: SocketRef, state: State<SocketState>) {
    // Delete rooms from state if they are empty
    let room_id = get_data_from_extension(&socket)[1].clone();
    if let Some(mut room) = state.get(room_id.clone()) {
        // Disconnect the player from the room
        socket
            .to(room_id.clone())
            .emit("opponent_disconnected", ())
            .unwrap_or_else(|e| {
                error!("Error sending disconnection event: {:?}", e);
            });
        room.disconnect_player(socket.id.to_string());
        state.update(room_id.clone(), room);
    }
    info!("Player {} disconnected", socket.id);
}
