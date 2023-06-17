import {Title} from "solid-start";
import Counter from "~/components/Counter";

export default function Home() {

  function signIn() {

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
