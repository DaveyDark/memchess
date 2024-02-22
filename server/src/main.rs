use axum::Router;
use socketioxide::SocketIoBuilder;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::info;

use socket::state::SocketState;

mod memory;
mod room;
mod socket;
mod util;

#[shuttle_runtime::main]
pub async fn axum(
    #[shuttle_secrets::Secrets] _secrets: shuttle_secrets::SecretStore,
) -> shuttle_axum::ShuttleAxum {
    // State for the socket server
    let rooms = SocketState::new();

    // Create a SocketIO server layer with the state
    let (layer, io) = SocketIoBuilder::new().with_state(rooms).build_layer();

    // Serve the socket server at the root path using the on_connect handler
    io.ns("/", socket::on_connect);

    // Make a axum router with the socket server layer and a CORS layer
    let app = Router::new().layer(
        ServiceBuilder::new()
            .layer(CorsLayer::permissive())
            .layer(layer),
    );

    info!("Starting server");

    // Hand off the router to Shuttle Runtime
    Ok(app.into())
}
