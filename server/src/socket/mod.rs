use socketioxide::extract::SocketRef;
use tracing::info;

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
    socket.on("create_room", handlers::room::on_create_room);
    socket.on("rooms", handlers::debug::on_rooms);
    socket.on("join_room", handlers::room::on_join_room);
    socket.on("start_game", handlers::game::on_start_game);
    socket.on("reset_game", handlers::game::on_reset_game);

    // Debug events
    socket.on("message", handlers::debug::on_message);
    socket.on("extensions", handlers::debug::on_extensions);

    socket.on_disconnect(handlers::on_disconnect)
}
