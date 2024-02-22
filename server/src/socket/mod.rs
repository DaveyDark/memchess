use socketioxide::extract::{SocketRef, State};
use tracing::{error, info};

use crate::{socket::state::SocketState, util::get_data_from_extension};

pub mod handlers;
pub mod state;

pub fn on_connect(socket: SocketRef) {
    info!("New connection: {:?}", socket);
    // Set extensions
    // Extensions will store the username and current room of the player, separated by a "|"
    // Username will default to the socket id
    // Room id can be empty if the user hasn't joined a room yet
    socket.extensions.insert(format!("{}|", socket.id));

    // Register handlers
    // Room Events
    socket.on("create_room", handlers::room::on_create_room);
    socket.on("join_room", handlers::room::on_join_room);
    socket.on("leave_room", handlers::room::on_leave_room);

    // Game Events
    socket.on("start_game", handlers::game::on_start_game);
    socket.on("reset_game", handlers::game::on_reset_game);

    // User Events
    socket.on("set_name", handlers::user::on_set_name);

    // Debug events
    socket.on("message", handlers::debug::on_message);
    socket.on("extensions", handlers::debug::on_extensions);
    socket.on("rooms", handlers::debug::on_rooms);

    socket.on_disconnect(on_disconnect)
}

pub fn on_disconnect(socket: SocketRef, state: State<SocketState>) {
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
        if room.is_empty() {
            // If the room is empty, remove it from the state
            state.remove(room_id.clone());
        } else {
            // Otherwise, update the state with the new room data
            state.update(room_id.clone(), room);
        }
    }
    info!("Player {} disconnected", socket.id);
}
