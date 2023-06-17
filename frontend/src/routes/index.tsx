import {redirect} from "solid-start";

export default function Home() {

  function signIn() {
    let clientId = "b06e85e5bb8f2bced706";
    let clientSecret = "4afc3de105b9b0cc76168909c6e7238f126fca09";

    window.location.href = "https://github.com/login/oauth/authorize?client_id=" + clientId + "&scope=read:user" ;
  }

  return (
    <main>
      <h2>Hello</h2>

      <button onclick={signIn}>
        sign in
      </button>
    </main>
  );
}
