use rand::{distributions::Alphanumeric, thread_rng, Rng};
use serde_json::json;
use socketioxide::extract::{Data, SocketRef, State};
use tracing::{error, info};

use crate::{
    room::{Room, RoomState, RoomType},
    socket::state::SocketState,
    util::get_data_from_extension,
};

// Struct to represent join_room params
#[derive(Debug, Clone, serde::Deserialize)]
pub struct JoinRoom {
    room_id: String,
    name: String,
    avatar: String,
    avatar_orientation: u8,
    avatar_color: String,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct CreateRoom {
    name: String,
    avatar: String,
    avatar_orientation: u8,
    avatar_color: String,
    time: Option<u64>,
}

pub async fn on_create_room(
    socket: SocketRef,
    state: State<SocketState>,
    Data::<CreateRoom>(p1): Data<CreateRoom>,
) {
    // Check if player is already in a room
    let room_id = get_data_from_extension(&socket);
    if room_id != "" {
        // Disconnect player from existing room
        if let Some(mut room) = state.get(room_id.clone()).await {
            room.disconnect_player(socket.id.to_string());
            if room.player_count() == 0 {
                state.remove(room_id.clone()).await;
            } else {
                state.update(room_id.clone(), room).await;
            }
        }
    }

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
    socket.extensions.insert(room_id.clone());

    let room_type = if let Some(t) = p1.time {
        RoomType::Timed(t)
    } else {
        RoomType::Casual
    };

    // Send the generated room ID back to the client
    socket
        .emit("room_joined", (room_id.clone(), room_type.to_string()))
        .unwrap_or_else(|e| {
            error!("Error sending roomCreated event: {:?}", e);
            return;
        });

    // Create a new room in the state
    let new_room = Room::new(
        socket.id.clone().to_string(),
        p1.name,
        p1.avatar,
        p1.avatar_orientation,
        p1.avatar_color,
        room_type,
    );
    info!("Created room {:?}", new_room.clone());
    state.add(room_id.clone(), new_room).await;

    info!("{} created and joined room {}", socket.id, room_id);
}

pub async fn on_join_room(
    socket: SocketRef,
    Data::<JoinRoom>(data): Data<JoinRoom>,
    state: State<SocketState>,
) {
    // Check if player is already in a room
    let room_id = data.room_id.clone();
    let rid = get_data_from_extension(&socket);
    if rid == room_id {
        // If the player is already in the room, do nothing
        return;
    }
    if rid != "" {
        // Disconnect player from existing room
        if let Some(mut room) = state.get(rid.clone()).await {
            room.disconnect_player(socket.id.to_string());
            if room.player_count() == 0 {
                state.remove(rid.clone()).await;
            } else {
                state.update(rid.clone(), room).await;
            }
        }
    }

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
        room.connect_player(
            socket.id.to_string(),
            data.name,
            data.avatar,
            data.avatar_orientation,
            data.avatar_color,
        );
        state.update(room_id.clone(), room.clone()).await;

        // Insert the room ID into the socket extensions for easy access
        socket.extensions.insert(room_id.clone());

        let turn = room.get_turn().unwrap_or(String::new());
        let times = room.get_player_times().await;

        // Emit turn event if the room is already playing
        if room.get_state() == RoomState::Playing {
            socket
                .within(room_id.clone())
                .emit("turn", (turn, times))
                .unwrap_or_else(|e| {
                    error!("Error sending turn event: {:?}", e);
                    return;
                });
        }

        socket
            .emit(
                "room_joined",
                (room_id.clone(), room.get_type().to_string()),
            )
            .unwrap_or_else(|e| {
                error!("Error sending room_joined event: {:?}", e);
                return;
            });

        // Send player joined event to room
        socket
            .within(room_id.clone())
            .emit("room_full", room.get_state())
            .unwrap_or_else(|e| {
                error!("Error sending player_joined event: {:?}", e);
                return;
            });

        info!("Player {} joined room {}", socket.id, &room_id);
    } else {
        // Send an error message if the room is full or doesn't exist
        socket
            .emit("join_failed", "Room is full or does not exist")
            .unwrap_or_else(|e| {
                error!("Error sending error_message event: {:?}", e);
                return;
            })
    }
}

pub async fn on_leave_room(socket: SocketRef, state: State<SocketState>) {
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
        // Clear extensions
        socket.extensions.clear();
        socket.extensions.insert(format!("{}|", socket.id));

        // Leave the room
        socket.leave(room_id.clone()).unwrap_or_else(|e| {
            error!("Error leaving room: {:?}", e);
        });
        info!("Player {} left room {}", socket.id, room_id);
    }
}

pub async fn on_room_info(socket: SocketRef, state: State<SocketState>) {
    let room_id = get_data_from_extension(&socket);
    if let Some(room) = state.get(room_id.clone()).await {
        // Send the room info to the client
        socket
            .emit("room_info", json!(room))
            .unwrap_or_else(|e| error!("Error sending room_info event: {:?}", e));
    } else {
        socket
            .emit("room_info", {})
            .unwrap_or_else(|e| error!("Error sending room_info event: {:?}", e));
    }
}
