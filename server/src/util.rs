use socketioxide::extract::SocketRef;
use tracing::error;

pub fn get_data_from_extension(socket: &SocketRef) -> String {
    match socket.extensions.get::<String>() {
        None => {
            error!("Expected a string in the socket extensions");
            String::new()
        }
        Some(s) => s.to_string(),
    }
}
