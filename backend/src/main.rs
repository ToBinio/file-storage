use std::net::SocketAddr;

use axum::Router;

mod api;

#[tokio::main]
async fn main() {
    let routes = Router::new().nest("/api", api::router());

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Listening on {addr}");
    axum::Server::bind(&addr)
        .serve(routes.into_make_service())
        .await
        .unwrap()
}
