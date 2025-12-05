import { component$, useSignal } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import { useCreateAccount, useSignIn } from "~/lib/auth";

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
    <div style={{display: "grid", height: "100%"}}>
      <main>
        {!hasAccount.value ?
          <article>
            <label for="username">Username:</label>
            <input id="username" name="username" type="text" onInput$={(e) => username.value = (e.target as HTMLInputElement).value} />
            <label for="password">Password:</label>
            <input id="password" name="password" type="password" onInput$={(e) => password.value = (e.target as HTMLInputElement).value} />
            <div style={{marginTop: "1rem", display: "flex", gap: "1rem", flexDirection: "column", alignItems: "center"}}>
              <button onClick$={() => createAccount.submit({ username: username.value, password: password.value })}>Create Account</button>
              <button onClick$={() => hasAccount.value = true}>Have an account?</button>
            </div>
          </article>
          : null}
        {hasAccount.value ?
          <article>
            <label for="username">Username:</label>
            <input id="username" name="username" type="text" onInput$={(e) => username.value = (e.target as HTMLInputElement).value} />
            <label for="password">Password:</label>
            <input id="password" name="password" type="password" onInput$={(e) => password.value = (e.target as HTMLInputElement).value} />
            <div style={{marginTop: "1rem", display: "flex", gap: "1rem", flexDirection: "column", alignItems: "center"}}>
              <button onClick$={() => signIn.submit({ username: username.value, password: password.value })}>Sign in</button>
              <button onClick$={() => hasAccount.value = false}>Need an account?</button>
            </div>
          </article>
          : null
        }
      </main>
    </div>
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
