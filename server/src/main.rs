use axum::Router;
use socketioxide::SocketIoBuilder;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::info;

use socket::state::SocketState;

mod memory;
mod room;
mod socket;

#[shuttle_runtime::main]
pub async fn axum(
    #[shuttle_secrets::Secrets] _secrets: shuttle_secrets::SecretStore,
) -> shuttle_axum::ShuttleAxum {
    let rooms = SocketState::new();
    let (layer, io) = SocketIoBuilder::new().with_state(rooms).build_layer();
    io.ns("/", socket::on_connect);

    let app = Router::new().layer(
        ServiceBuilder::new()
            .layer(CorsLayer::permissive())
            .layer(layer),
    );

    info!("Starting server");

    Ok(app.into())
}
