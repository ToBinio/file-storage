import {
  createCookieSessionStorage,
  createRouteData, redirect,
  Title,
  useParams,
  useRouteData,
  useSearchParams
} from "solid-start";
import Counter from "~/components/Counter";
import {createEffect, createResource, onMount} from "solid-js";
import {useNavigate} from "@solidjs/router";

export default function Home() {

  const {token} = useRouteData<typeof routeData>();
  const navigate = useNavigate();

  let data = token();

  onMount(() => {

    if (data == undefined) {
      console.error(data)
    } else if ('error' in data) {
      console.error(data.error)
    } else {
      document.cookie = "data=" + data.access_token;
    }

    navigate("/")
  })

  return <>loading...</>;
}


export function routeData() {

  const params = useSearchParams<{ code: string }>()

  const token = createRouteData(async () => {
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