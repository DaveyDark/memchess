use socketioxide::extract::{Data, SocketRef, State};
use tracing::error;

use crate::{socket::state::SocketState, util::get_data_from_extension};

#[derive(Debug, Clone, serde::Serialize)]
struct Chat {
    chat: String,
    author: String,
}

pub async fn on_chat(
    socket: SocketRef,
    state: State<SocketState>,
    Data::<String>(chat): Data<String>,
) {
    let room_id = get_data_from_extension(&socket);
    let room = state.get(room_id.clone()).await;
    if room.is_none() {
        return;
    }

    socket
        .within(room_id)
        .emit(
            "chat",
            Chat {
                chat,
                author: socket.id.to_string(),
            },
        )
        .unwrap_or_else(|e| error!("Failed to emit piece_moved event: {}", e));
}
