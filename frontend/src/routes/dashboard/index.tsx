import { $, component$, useSignal, useContext } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

import useLocalstorage from "~/hooks/use-localstorage";
import styles from "./dashboard.module.scss";
import { ListsContext } from "../layout";

export default component$(() => {
  const onboardingComplete = useLocalstorage({ key: "birdspot.onboarding" });
  const lists = useContext(ListsContext)
  const showForm = useSignal(false);
  const selectedList = useSignal("");
  const targetDate = useSignal("");
  const regionCode = useSignal("");

  const handleSubmit = $(async () => {
    const lifeList = lists.lists.find(list => list.name === selectedList.value);
    if (!lifeList) {
      alert(`Life list "${selectedList.value}" not found in local storage`);
      return;
    }

    try {
      const response = await fetch(`/api/birdspot/${regionCode.value}/hotspots/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await cookieStore.get("jwt"))?.value || ""}`,
          "x-ebird-api-key": localStorage.getItem("ebird_api_key") || "",
        },
        body: JSON.stringify({
          life_list: lifeList,
          target_date: targetDate.value,
        }),
      });

      if (response.ok) {
        const job = await response.json();
        alert(`Report created: ${job.id}`);
        showForm.value = false;
        selectedList.value = "";
      } else {
        alert("Failed to create report");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Error creating report");
    }
  });

  return (
    <div>
      <main class={styles.main}>
        <h2>Welcome!</h2>
        <p>BirdSpot makes finding birds easier</p>
        {
          onboardingComplete.value !== "complete" ?
            <article class={styles.article}>
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
        <>
          <section>
            <article class={styles.article}>
              <h3>Your reports</h3>
              <p>Set up custom report to find birds more easily. Click "Add report" to get started.</p>
              <div class="button-wrapper">
                <button onClick$={() => showForm.value = true}>Add report</button>
              </div>
            </article>
          </section>
        </>
        {showForm.value && (
          <section>
            <article class={styles.article}>
              <h3>Create New Report</h3>
              <form
                action="#"
                onSubmit$={$(async (e) => {
                  e.preventDefault();
                  await handleSubmit();
                  return false;
                })}
              >
                <div>
                  <label htmlFor="list-select">Life List:</label>
                  <select
                    id="list-select"
                    value={selectedList.value}
                    onChange$={(e) => selectedList.value = (e.target as HTMLSelectElement).value}
                    required
                  >
                    <option value="" disabled>Select a list</option>
                    {lists.lists.map((list) => (
                      <option key={list.name} value={list.name}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="region-code">Region Code:</label>
                  <input
                    id="region-code"
                    type="text"
                    value={regionCode.value}
                    onInput$={(e) => regionCode.value = (e.target as HTMLInputElement).value}
                    placeholder="e.g., L10"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="target-date">Target Date:</label>
                  <input
                    id="target-date"
                    type="date"
                    value={targetDate.value}
                    onInput$={(e) => targetDate.value = (e.target as HTMLInputElement).value}
                    required
                  />
                </div>
                <div class="button-wrapper">
                  <button type="submit">Create Report</button>
                  <button type="button" onClick$={() => {
                      showForm.value = false;
                      selectedList.value = "";
                    }}>Cancel</button>
                </div>
              </form>
            </article>
          </section>
        )}
        {
          onboardingComplete.value === "complete" ?
            <>
              <section>
                <article class={styles.article}>
                  <h3>Brooklyn 11/30</h3>
                  <p>Your report for Monday, Decemeber 1st for Kings, NY</p>
                  <h4>Top Hotspots</h4>
                  <p>Prospect Park</p>
                  <p>BirdSpot Score: 0.871</p>
                  <p>Targets: Eastern Meadowlark, Purple Finch</p>
                  <p>Relevant checklists: X, Y, Z</p>
                </article>
                <article class={styles.article}>
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
