import {
    createCookieSessionStorage,
    createRouteData, parseCookie, redirect,
    Title,
    useParams,
    useRouteData,
    useSearchParams,
    useServerContext
} from "solid-start";
import {useNavigate} from "@solidjs/router";
import {isServer} from "solid-js/web";
import {createServerData$} from "solid-start/server";

export default function Home() {
    const {token} = useRouteData<typeof routeData>();
    const navigate = useNavigate();

    let data = token();

    if (!isServer) {
        if (data == undefined) {
            console.error(data)
        } else if ('error' in data) {
            console.error(data.error)
        } else {
            document.cookie = `githubToken=${data.access_token}; max-age=${60 * 60 * 24 * 7}`;
        }

        navigate("/")
    }

    return <>loading...</>;
}


export function routeData() {
    const token = createServerData$(async () => {
        const params = useSearchParams<{ code: string }>()

        //todo use .env

        const clientId = "b06e85e5bb8f2bced706";
        const clientSecret = "4afc3de105b9b0cc76168909c6e7238f126fca09";

        let res = await fetch(`https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${params[0].code}`, {
            method: "POST",
            headers: {accept: "application/json"}
        })

        return (await res.json()) as (Error | Token)
    })

    return {token};
}

type Error = {
    error: string,
    error_description: string,
    error_uri: string
}

type Token = {
    access_token: string
}