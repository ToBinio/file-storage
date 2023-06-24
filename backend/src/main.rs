use std::env;
use std::net::SocketAddr;

use axum::Router;
use diesel::{Connection, PgConnection, QueryDsl, RunQueryDsl, SelectableHelper};
use dotenvy::dotenv;
use tower_http::trace;
use tower_http::trace::TraceLayer;
use tracing::{info, Level};

use crate::models::User;
use crate::schema::users::dsl::users;

mod api;
mod jwt;

mod models;
mod schema;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_max_level(Level::INFO).init();

    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let mut connetion = PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url));

    println!(
        "{}",
        users
            .select(User::as_select())
            .load(&mut connetion)
            .expect("ok")
            .len()
    );

    let routes = Router::new().nest("/api", api::router()).layer(
        TraceLayer::new_for_http()
            .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
            .on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
    );

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    info!("Server Listing on {addr}");
    axum::Server::bind(&addr)
        .serve(routes.into_make_service())
        .await
        .unwrap()
}
