use axum::Router;

mod login;

pub fn router() -> Router {
    Router::new().nest("/login", login::router())
}
