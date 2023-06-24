use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Serialize, Deserialize)]
pub struct Jwt {
    user_name: String,
    id: u64,
    avatar_url: String,
}

#[derive(Debug, Error)]
pub enum JwtError {
    #[error("Could not create Token from Github api")]
    CouldNotCreateFromGithub,
    #[error("Could not sign the token")]
    CouldNotSign,
}

impl Jwt {
    pub fn sign(&self) -> Result<String, JwtError> {
        jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            self,
            &jsonwebtoken::EncodingKey::from_secret("secret".as_ref()),
        )
        .map_err(|e| JwtError::CouldNotSign)
    }

    pub async fn from_github(access_token: String) -> Result<Self, JwtError> {
        let client = reqwest::Client::new();

        let res = client
            .get("https://api.github.com/user")
            .header("User-Agent", "ToBinio App")
            .header("Authorization", format!("Bearer {access_token}"))
            .send()
            .await
            .map_err(|e| JwtError::CouldNotCreateFromGithub)?;

        let string = res
            .text()
            .await
            .map_err(|_e| JwtError::CouldNotCreateFromGithub)?;

        let res: GithubResponse =
            serde_json::from_str(&string).map_err(|_e| JwtError::CouldNotCreateFromGithub)?;

        Ok(Jwt {
            user_name: res.login,

            //todo
            id: 0,
            avatar_url: res.avatar_url,
        })
    }
}

#[derive(Deserialize)]
struct GithubResponse {
    login: String,
    id: u64,
    avatar_url: String,
}
