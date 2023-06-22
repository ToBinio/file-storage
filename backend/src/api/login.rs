use crate::jwt::{Jwt, JwtError};
use axum::response::{IntoResponse, Response};
use axum::routing::post;
use axum::{Json, Router};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use tracing::info;
use tracing::log::debug;

pub fn router() -> Router {
    Router::new().route("/", post(login_github))
}

#[derive(Deserialize)]
struct LoginGithubRequest {
    code: String,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum GithubResponse {
    Success { access_token: String },
    //todo i dont know what the values are....
    Fail { error: String },
}

#[derive(Debug)]
enum LoginError {
    GithubApi,
    InvalidCode(String),
    JwtError(JwtError),
}

impl IntoResponse for LoginError {
    fn into_response(self) -> Response {
        info!("{:?}", self);

        (StatusCode::INTERNAL_SERVER_ERROR, "error: UNHANDLED_ERROR").into_response()
    }
}

async fn login_github(data: Json<LoginGithubRequest>) -> Result<Json<String>, LoginError> {
    let client = reqwest::Client::new();

    let client_id = "b06e85e5bb8f2bced706";
    let client_secret = "4afc3de105b9b0cc76168909c6e7238f126fca09";

    let res = client.post( format!("https://github.com/login/oauth/access_token?client_id={client_id}&client_secret={client_secret}&code={}",data.code))
        .header("Accept","application/json")
        .send().await.map_err(|_e| LoginError::GithubApi)?;

    let response: GithubResponse =
        serde_json::from_str(&res.text().await.map_err(|_e| LoginError::GithubApi)?)
            .map_err(|_e| LoginError::InvalidCode(data.code.to_string()))?;

    match response {
        GithubResponse::Success { access_token } => {
            let jwt = Jwt::from_github(access_token)
                .await
                .map_err(|e| LoginError::JwtError(e))?
                .sign()
                .map_err(|e| LoginError::JwtError(e))?;

            Ok(Json(jwt))
        }
        GithubResponse::Fail { error } => Err(LoginError::InvalidCode(error)),
    }
}
