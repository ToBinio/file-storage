use std::net::SocketAddr;

use axum::Router;
use tower_http::trace::TraceLayer;
use tracing::{info, Level};

mod api;
mod jwt;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(Level::DEBUG)
        .init();

    let routes = Router::new()
        .nest("/api", api::router())
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    info!("Server Listing on {addr}");
    axum::Server::bind(&addr)
        .serve(routes.into_make_service())
        .await
        .unwrap()
}
