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
    socket.on("room_info", handlers::room::on_room_info);

    // Game Events
    socket.on("reset_game", handlers::game::on_reset_game);

    // Memory Game Events
    socket.on("flip_tile", handlers::memory::on_flip_tile);
    socket.on("match_tiles", handlers::memory::on_match_tiles);

    // Chess Game Events
    socket.on("move_piece", handlers::chess::on_move_piece);

    // Chat Events
    socket.on("chat", handlers::chat::on_chat);

    // User Events
    socket.on("player_info", handlers::user::on_player_info);

    // Debug events
    socket.on("message", handlers::debug::on_message);
    socket.on("extensions", handlers::debug::on_extensions);
    socket.on("rooms", handlers::debug::on_rooms);

    socket.on_disconnect(on_disconnect)
}

pub async fn on_disconnect(socket: SocketRef, state: State<SocketState>) {
    let room_id = get_data_from_extension(&socket);
    if let Some(mut room) = state.get(room_id.clone()).await {
        // Disconnect the player from the room
        socket
            .to(room_id.clone())
            .emit("opponent_disconnected", ())
            .unwrap_or_else(|e| {
                error!("Error sending disconnection event: {:?}", e);
            });
        room.disconnect_player(socket.id.to_string());
        if room.player_count() == 0 {
            // If the room is empty, remove it from the state
            state.remove(room_id.clone()).await;
        } else {
            // Otherwise, update the state with the new room data
            state.update(room_id.clone(), room).await;
        }
    }
    info!("Player {} disconnected", socket.id);
}
