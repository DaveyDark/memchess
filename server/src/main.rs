use axum::{routing::get, serve, Router};
use serde_json::Value;
use socketioxide::{
    extract::{Data, SocketRef},
    SocketIo,
};
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::info;
use tracing_subscriber::FmtSubscriber;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    let (layer, io) = SocketIo::new_layer();
    io.ns("/", on_connect);

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .layer(
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

    socket.on("message", |_socket: SocketRef, Data::<Value>(data)| {
        info!("Received message: {:?}", data);
    });
}
