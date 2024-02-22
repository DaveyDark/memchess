use rand::{distributions::Alphanumeric, thread_rng, Rng};
use serde_json::json;
use socketioxide::extract::{Data, SocketRef, State};
use tracing::{error, info};

use crate::{room::Room, socket::state::SocketState};

pub fn on_message(socket: SocketRef, Data::<String>(data): Data<String>) {
    info!(
        "Received message: {:?} from {}",
        data,
        socket.id.to_string()
    );
}

pub fn on_create_room(socket: SocketRef, state: State<SocketState>) {
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
    socket.extensions.insert(room_id.clone());

    // Send the generated room ID back to the client
    socket
        .emit("room_created", json!({ "room_id": room_id.clone() }))
        .unwrap_or_else(|e| {
            error!("Error sending roomCreated event: {:?}", e);
            return;
        });

    let new_room = Room::new(socket.id.clone().to_string());
    info!("Created room {:?}", new_room.clone());
    state.add(room_id.clone(), new_room);

    info!("{} created and joined room {}", socket.id, room_id);
}

pub fn on_rooms(state: State<SocketState>) {
    info!("Rooms: {:?}", state.get_all());
}

pub fn on_join_room(
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
        // Notify players that the game is starting
        socket
            .within(room_id.clone())
            .emit("game_start", ())
            .unwrap_or_else(|e| {
                error!("Error sending game_start event: {:?}", e);
                return;
            });
        let mut room = state.get(room_id.clone()).expect("Expected room to exist");
        room.start_game(socket.id.to_string());
        state.update(room_id.clone(), room);

        socket.extensions.insert(room_id.clone());
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

pub fn on_disconnect(socket: SocketRef, state: State<SocketState>) {
    // Delete rooms from state if they are empty
    let room_id = socket.extensions.get::<String>().unwrap().clone();
    if let Some(room) = state.get(room_id.clone()) {
        if room.is_playing() {
            socket
                .to(room_id.clone())
                .emit("forfeit", ())
                .unwrap_or_else(|e| {
                    error!("Error sending forfeit event: {:?}", e);
                })
        }
    }
    state.remove(room_id.clone());
    info!("Player {} disconnected", socket.id);
}
