import {createRouteData, parseCookie, refetchRouteData, useRouteData, useServerContext} from "solid-start";
import {isServer, Show} from "solid-js/web";
import styles from "./index.module.scss"
import {decodeJwt} from "jose";

export default function Home() {

    let data = useRouteData<typeof routeData>();

    function signIn() {
        let clientId = "b06e85e5bb8f2bced706";

        window.location.href = "https://github.com/login/oauth/authorize?client_id=" + clientId + "&scope=read:user";
    }

    function logOut() {
        document.cookie = "githubToken=;max-age=0"
        refetchRouteData("cookies").then(
            () => {
                refetchRouteData("user").then()
            }
        )
    }

    return (
        <main>
            <div id={styles.header}>
                <h2>Web Storage</h2>

                <Show when={data.user() != undefined}>
                    huff
                    {/*name: {data.user()?.login}*/}
                    {/*<div>*/}
                    {/*    <img src={data.user()?.avatar_url} alt="avatar"/>*/}
                    {/*</div>*/}
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

        console.debug(data);

        let cookies = parseCookie(data) as { jwt: string }

        if (cookies.jwt == undefined) return undefined;

        console.log("cookie:" + cookies.jwt);

        let token = "";

        try {
            // @ts-ignore
            token = decodeJwt(cookies.jwt);
        } catch (e) {

        }

        console.log("token " + token);

        return token;
    }, {key: "cookies"})

    return {user}
}