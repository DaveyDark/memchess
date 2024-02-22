use rand::{distributions::Alphanumeric, thread_rng, Rng};
use socketioxide::extract::{Data, SocketRef, State};
use tracing::{error, info};

use crate::{
    room::Room,
    socket::state::SocketState,
    util::{format_extension, get_data_from_extension},
};

pub async fn on_create_room(socket: SocketRef, state: State<SocketState>) {
    // Disconnect from any previous rooms
    socket.leave_all().unwrap_or_else(|e| {
        error!("Error leaving all rooms: {:?}", e);
        return;
    });

    // Generate a random room ID
    info!("Creating room for player {}", socket.id);
    let room_id: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect();

    // Join the socket to the generated room ID
    socket.join(room_id.clone()).unwrap_or_else(|e| {
        error!("Error joining room: {:?}", e);
        return;
    });

    // Insert the room ID into the socket extensions for easy access
    let mut ext_data = get_data_from_extension(&socket);
    ext_data[1] = room_id.clone();
    socket.extensions.insert(format_extension(ext_data));

    // Send the generated room ID back to the client
    socket
        .emit("room_created", room_id.clone())
        .unwrap_or_else(|e| {
            error!("Error sending roomCreated event: {:?}", e);
            return;
        });

    // Create a new room in the state
    let new_room = Room::new(socket.id.clone().to_string());
    info!("Created room {:?}", new_room.clone());
    state.add(room_id.clone(), new_room).await;

    info!("{} created and joined room {}", socket.id, room_id);
}

pub async fn on_join_room(
    socket: SocketRef,
    Data::<String>(room_id): Data<String>,
    state: State<SocketState>,
) {
    // Check if the room exists and has only one player
    info!("Player {} is trying to join room {}", socket.id, room_id);
    if socket.within(room_id.clone()).sockets().unwrap().len() == 1 {
        // Add the second player to the room
        socket.join(room_id.clone()).unwrap_or_else(|e| {
            error!("Error joining room: {:?}", e);
            return;
        });
        // Update the state to add the second player to the room
        let mut room = state
            .get(room_id.clone())
            .await
            .expect("Expected room to exist");
        room.connect_player(socket.id.to_string());
        state.update(room_id.clone(), room).await;

        // Insert the room ID into the socket extensions for easy access
        let mut ext_data = get_data_from_extension(&socket);
        ext_data[1] = room_id.clone();
        socket.extensions.insert(format_extension(ext_data));

        info!("Player {} joined room {}", socket.id, &room_id);
    } else {
        // Send an error message if the room is full or doesn't exist
        socket
            .emit("error_message", "Room is full or does not exist")
            .unwrap_or_else(|e| {
                error!("Error sending error_message event: {:?}", e);
                return;
            })
    }
}

pub async fn on_leave_room(socket: SocketRef, state: State<SocketState>) {
    let room_id = get_data_from_extension(&socket)[1].clone();
    if let Some(mut room) = state.get(room_id.clone()).await {
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
            state.remove(room_id.clone()).await;
        } else {
            // Otherwise, update the state with the new room data
            state.update(room_id.clone(), room).await;
        }
    }
    info!("Player {} left room {}", socket.id, room_id);
}
