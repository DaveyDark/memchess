use socketioxide::extract::SocketRef;
use tracing::info;

pub mod handlers;
pub mod state;

pub fn on_connect(socket: SocketRef) {
    info!("New connection: {:?}", socket);

    socket.on("message", handlers::on_message);

    socket.on("create_room", handlers::on_create_room);

    socket.on("rooms", handlers::on_rooms);

    socket.on("join_room", handlers::on_join_room);

    socket.on_disconnect(handlers::on_disconnect)
}
