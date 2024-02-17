use axum::{serve, Router};
use rand::{distributions::Alphanumeric, thread_rng, Rng};
use serde_json::{json, Value};
use socketioxide::{
    extract::{Data, SocketRef},
    SocketIo,
};
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::{error, info};
use tracing_subscriber::FmtSubscriber;

#[derive(serde::Deserialize)]
struct RoomID {
    room_id: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    let (layer, io) = SocketIo::new_layer();
    io.ns("/", on_connect);

    let app = Router::new().layer(
        ServiceBuilder::new()
            .layer(CorsLayer::permissive())
            .layer(layer),
    );
    let listener = TcpListener::bind("0.0.0.0:3000").await?;

    info!("Starting server");

    serve(listener, app).await?;

    Ok(())
}

async fn on_connect(socket: SocketRef) {
    info!("New connection: {:?}", socket);

    socket.on("message", |_socket: SocketRef, Data::<String>(data)| {
        info!("Received message: {:?}", data);
    });

    socket.on("create_room", move |socket: SocketRef, Data::<Value>(_)| {
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

        // Send the generated room ID back to the client
        socket
            .emit("room_created", json!({ "room_id": room_id.clone() }))
            .unwrap_or_else(|e| {
                error!("Error sending roomCreated event: {:?}", e);
                return;
            });

        info!("{} created and joined room {}", socket.id, room_id);
    });

    socket.on(
        "join_room",
        move |socket: SocketRef, Data::<RoomID>(data)| {
            // Check if the room exists and has only one player
            let room_id = data.room_id;
            info!("Player {} is trying to join room {}", socket.id, room_id);
            if socket.within(room_id.clone()).sockets().unwrap().len() == 1 {
                // Add the second player to the room
                socket.join(room_id.clone()).unwrap_or_else(|e| {
                    error!("Error joining room: {:?}", e);
                    return;
                });
                // Notify players that the game is starting
                socket
                    .to(room_id.clone())
                    .emit("game_start", ())
                    .unwrap_or_else(|e| {
                        error!("Error sending game_start event: {:?}", e);
                        return;
                    });
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
        },
    );

    // Event handler for disconnecting
    socket.on_disconnect(|socket: SocketRef| {
        info!("Player {} disconnected", socket.id);
    });
}
