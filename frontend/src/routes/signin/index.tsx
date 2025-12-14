import { component$, useSignal } from "@builder.io/qwik";
import { DocumentHead, Link } from "@builder.io/qwik-city";
import { useCreateAccount, useSignIn } from "~/lib/auth";

import styles from "./signin.module.scss";
import { Label } from "@qwik-ui/headless";

export default component$(() => {
  const signIn = useSignIn();
  const createAccount = useCreateAccount();
  const hasAccount = useSignal(false);
  const username = useSignal<string>();
  const password = useSignal<string>();

  if (signIn.value || createAccount.value) {
    window.location.assign("/dashboard");
  }

  return (
    <main class={styles.container}>
      <article>
        <h2>{!hasAccount.value ? "Create Account" : "Sign In"}</h2>
        <p>{!hasAccount.value ? "A unique username and strong password is all you need to get started. We don't store any personal information!" : null}</p>
        <div>
          <Label for="username">Username:</Label>
          <input id="username" name="username" type="text" onInput$={(e) => username.value = (e.target as HTMLInputElement).value} />
        </div>
        <div>
          <Label for="password">Password:</Label>
          <input id="password" name="password" type="password" onInput$={(e) => password.value = (e.target as HTMLInputElement).value} />
        </div>
        <div class={styles["controls-wrapper"]}>
          {!hasAccount.value ?
            <>
              <button onClick$={() => createAccount.submit({ username: username.value, password: password.value })}>Create Account</button>
              <Link href="#" onClick$={() => hasAccount.value = true}>Have an account?</Link>
            </> :
            <>
              <button onClick$={() => signIn.submit({ username: username.value, password: password.value })}>Sign in</button>
              <Link href="#" onClick$={() => hasAccount.value = false}>Need an account?</Link>
            </>
          }
        </div>
      </article>
    </main>
  )
});

export const head: DocumentHead = {
  title: "BirdSpot - Sign In",
  meta: [
    {
      name: "description",
      content: "Make finding birds easier",
    },
  ],
};
