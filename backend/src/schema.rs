// @generated automatically by Diesel CLI.

diesel::table! {
    users (id) {
        id -> Int4,
        name -> Varchar,
        avatar_url -> Varchar,
        github_id -> Nullable<Int4>,
    }
}
