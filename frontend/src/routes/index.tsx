import {createRouteData, parseCookie, refetchRouteData, useRouteData, useServerContext} from "solid-start";
import {isServer, Show} from "solid-js/web";
import styles from "./index.module.scss"
import {decodeJwt} from "jose";
import {JWT_COOKIE, User} from "~/types/types";

export default function Home() {

  let data = useRouteData<typeof routeData>();

  function signIn() {
    let clientId = "b06e85e5bb8f2bced706";

    window.location.href = "https://github.com/login/oauth/authorize?client_id=" + clientId + "&scope=read:user";
  }

  function logOut() {
    document.cookie = JWT_COOKIE + "=;max-age=0"
    refetchRouteData("user").then()
  }

  return (
    <main>
      <div id={styles.header}>
        <h2>Web Storage</h2>
        <Show when={data.user() != undefined}>
          name: {data.user()?.user_name}
          <div>
            <img src={data.user()?.avatar_url} alt="avatar"/>
          </div>
        </Show>
      </div>

      <button onclick={signIn}>
        sign in
      </button>

      <Show when={data.user() != undefined}>
        <button onclick={logOut}>
          log out
        </button>
      </Show>
    </main>
  );
}

export function routeData() {
  let user = createRouteData(() => {
    const event = useServerContext();

    let data = isServer
      ? event.request.headers.get("cookie") ?? ""
      : document.cookie;

    let jwt = parseCookie(data)[JWT_COOKIE];

    let user = undefined;

    try {
      user = decodeJwt(jwt) as unknown as User;
    } catch (e) {
    }

    return user;
  }, {key: "user"})

  return {user}
}