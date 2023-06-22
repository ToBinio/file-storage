import {useRouteData, useSearchParams} from "solid-start";
import {useNavigate} from "@solidjs/router";
import {isServer} from "solid-js/web";
import {createServerData$} from "solid-start/server";
import {JWT_COOKIE} from "~/types/types";

export default function Home() {
  const {token} = useRouteData<typeof routeData>();
  const navigate = useNavigate();

  let data = token();

  if (!isServer) {
    if (data == undefined || data.startsWith("error")) {
      console.error(data)
    } else {
      document.cookie = JWT_COOKIE + `=${data}; max-age=${60 * 60 * 24 * 7}`;
    }

    navigate("/")
  }

  return <>loading...</>;
}


export function routeData() {
  const token = createServerData$(async () => {
    const params = useSearchParams<{ code: string }>()

    let res = await fetch(`http://127.0.0.1:8080/api/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({code: params[0].code})
    })

    return await res.text()
  })

  return {token};
}