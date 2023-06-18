import {createRouteData, parseCookie, redirect, refetchRouteData, useRouteData, useServerContext} from "solid-start";
import {isServer, Show} from "solid-js/web";
import {User} from "~/types/types";

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
            <h2>Hello
                <Show when={data.user() != undefined}>
                    , {data.user()?.login}
                    <img src={data.user()?.avatar_url} alt="avatar"/>
                </Show>
            </h2>

            <button onclick={signIn}>
                sign in
            </button>

            <Show when={data.cookies()?.githubToken != undefined}>
                <button onclick={logOut}>
                    log out
                </button>
            </Show>
        </main>
    );
}

export function routeData() {
    let cookies = createRouteData(() => {
        const event = useServerContext();

        let data = isServer
            ? event.request.headers.get("cookie") ?? ""
            : document.cookie;

        console.log("update cookies " + data);

        return parseCookie(data) as { githubToken: string };
    }, {key: "cookies"})

    let user = createRouteData(async ([, cookies]) => {

        if (cookies == undefined || typeof cookies == 'string') throw "cookies could not be loaded"

        if (cookies.githubToken == undefined) return undefined

        let res = await fetch("https://api.github.com/user", {
            method: "GET",
            headers: {Authorization: "Bearer " + cookies.githubToken}
        })

        console.log("update user data: " + cookies.githubToken);

        return (await res.json()) as User;
    }, {key: () => ["user", cookies()]});

    return {cookies, user}
}