CREATE TABLE users
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR NOT NULL,
    avatar_url VARCHAR NOT NULL,

    github_id  int
)