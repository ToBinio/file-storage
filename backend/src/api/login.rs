use axum::response::{IntoResponse, Response};
use axum::routing::post;
use axum::{Json, Router};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use tracing::info;

pub fn router() -> Router {
    Router::new().route("/", post(login_github))
}

#[derive(Deserialize)]
struct GithubRequest {
    code: String,
}

#[derive(Serialize)]
struct GithubResponse {
    token: String,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
}

#[derive(Debug)]
enum LoginError {
    GithubApi,
    InvalidCode(String),
}

impl IntoResponse for LoginError {
    fn into_response(self) -> Response {
        info!("{:?}", self);

        (StatusCode::INTERNAL_SERVER_ERROR, "UNHANDLED_ERROR").into_response()
    }
}

async fn login_github(data: Json<GithubRequest>) -> Result<Json<GithubResponse>, LoginError> {
    let client = reqwest::Client::new();

    let client_id = "b06e85e5bb8f2bced706";
    let client_secret = "4afc3de105b9b0cc76168909c6e7238f126fca09";

    let res = client.post( format!("https://github.com/login/oauth/access_token?client_id={client_id}&client_secret={client_secret}&code={}",data.code))
        .header("Accept","application/json")
        .send().await.map_err(|_e| LoginError::InvalidCode(data.code.to_string()))?;

    let token: TokenResponse =
        serde_json::from_str(&res.text().await.map_err(|_e| LoginError::GithubApi)?)
            .map_err(|_e| LoginError::InvalidCode(data.code.to_string()))?;

    let response = GithubResponse {
        token: token.access_token,
    };

    Ok(Json(response))
}
