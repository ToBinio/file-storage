import {useRouteData, useSearchParams} from "solid-start";
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
            document.cookie = `githubToken=${data.token}; max-age=${60 * 60 * 24 * 7}`;
        }

    navigate("/")
  }

  return <>loading...</>;
}


export function routeData() {
  const token = createServerData$(async () => {
    const params = useSearchParams<{ code: string }>()

        let res = await fetch(`http://localhost:8080/api/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({code: params[0].code})
        })

        return (await res.json()) as Token
    })

  return {token};
}

type Token = {
    token: string
}