use socketioxide::extract::{Data, SocketRef, State};
use tracing::{error, info};

use crate::{socket::state::SocketState, util::get_data_from_extension};

pub fn on_message(socket: SocketRef, Data::<String>(data): Data<String>) {
    // Debug event to test communication
    info!(
        "Received message: {:?} from {}",
        data,
        socket.id.to_string()
    );
}

pub fn on_rooms(socket: SocketRef, state: State<SocketState>) {
    socket
        .emit("rooms", format!("{:?}", state.get_all()))
        .unwrap_or_else(|e| {
            error!("Error sending rooms event: {:?}", e);
        });
}

pub fn on_extensions(socket: SocketRef) {
    socket
        .emit(
            "extensions",
            format!("{:?}", get_data_from_extension(&socket)),
        )
        .unwrap_or_else(|e| {
            error!("Error sending extensions event: {:?}", e);
        });
}
