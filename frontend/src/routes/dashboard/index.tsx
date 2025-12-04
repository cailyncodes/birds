import { $, component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

import useLocalstorage from "~/components/hooks/use-localstorage";
import "./dashboard.css";

export default component$(() => {
  const onboardingComplete = useLocalstorage({ key: "birdspot.onboarding" })
  return (
    <div>
      <main>
        <h2>Welcome!</h2>
        <p>BirdSpot makes finding birds easier</p>
        {
          onboardingComplete.value !== "complete" ?
            <article>
              <h3>Getting started</h3>
              <p>1. Make an <a href="https://ebird.org/home" target="_blank" rel="noopener noreferrer">eBird account</a>.</p>
              <p>2. Configure your BirdSpot account on <Link href="/dashboard/settings/">settings</Link>.</p>
              <p>3. Set up searches on your dashboard (see below).</p>
              <p>4. Find more birds.</p>
              <div class="button-wrapper">
                <button onClick$={$(() => {
                  window.localStorage.setItem("birdspot.onboarding", "complete");
                  window.dispatchEvent(new CustomEvent("localstorageupdate", { detail: { key: "birdspot.onboarding" } }))
                })}>All set!</button>
              </div>
            </article>
            : null
        }
        {
          onboardingComplete.value === "complete" ?
            <>
              <section>
                <article>
                  <h3>Brooklyn 11/30</h3>
                  <p>Your report for Monday, Decemeber 1st for Kings, NY</p>
                  <h4>Top Hotspots</h4>
                  <p>Prospect Park</p>
                  <p>BirdSpot Score: 0.871</p>
                  <p>Targets: Eastern Meadowlark, Purple Finch</p>
                  <p>Relevant checklists: X, Y, Z</p>
                </article>
                <article>
                  <h3>Daily report</h3>
                  <p>Your report for Monday, Decemeber 1st for Kings, NY</p>
                  <h4>Top Hotspots</h4>
                  <p>Prospect Park</p>
                  <p>BirdSpot Score: 0.871</p>
                  <p>Targets: Eastern Meadowlark, Purple Finch</p>
                  <p>Relevant checklists: X, Y, Z</p>
                </article>
              </section>
              <section>

              </section>
            </>
            : null
        }
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "BirdSpot - Dashboard",
  meta: [
    {
      name: "description",
      content: "Make finding birds easier",
    },
  ],
};
