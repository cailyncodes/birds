import { $, component$, useSignal, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

import useLocalstorage from "~/hooks/use-localstorage";
import styles from "./dashboard.module.scss";
import { ListsContext } from "../layout";

export default component$(() => {
  const onboardingComplete = useLocalstorage({ key: "birdspot.onboarding" });
  const lists = useContext(ListsContext)
  const showForm = useSignal(false);
  const jobs = useSignal<string[]>([]);
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
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/birdspot/${regionCode.value}/hotspots/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await window.cookieStore.get("jwt"))?.value || ""}`,
          "x-ebird-api-key": localStorage.getItem("ebird-api-token") || "",
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
  // Fetch user jobs on component mount
  useVisibleTask$(async () => {
    const jwt = (await window.cookieStore.get("jwt"))?.value || "";
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/jobs`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      jobs.value = data;
    }
  });

  return (
    <div>
      <main class={styles.main}>
        <h2>Welcome, there!</h2>
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
        {(onboardingComplete.value === "complete") ? (
          <>
            <>
              <section>
                <article class={styles.article}>
                  <h3>Create reports</h3>
                  <p>Set up custom report to find birds more easily. Click "Add report" to get started.</p>
                  <div class={styles["button-wrapper"]}>
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
                      <label for="list-select">Life List:</label>
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
                      <label for="region-code">Region Code:</label>
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
                      <label for="target-date">Target Date:</label>
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
            <section>
              <article>
                <h3>My Reports</h3>
                {jobs.value.length > 0 ?
                  jobs.value.map((job) => (
                    <>
                      {/* @ts-expect-error temp */}
                      <article key={job.id} class={styles.article}>
                        {/* @ts-expect-error temp */}
                        {job.state === "running" ? <section>
                          {/* @ts-expect-error temp */}
                          <h4>{job.region_code} on {new Date(Date.parse(job.target_date)).toLocaleDateString()}</h4>
                          <p>Report is being generated...</p>
                        </section> : null}
                        {/* @ts-expect-error temp */}
                        {job.state === "completed" ? (<ul data-jobid={job.id}>
                          {/* @ts-expect-error temp */}
                          <h4>{job.region_code} on {new Date(Date.parse(job.target_date)).toLocaleDateString()}</h4>
                          {/* @ts-expect-error temp */}
                          {job.response[0].birdspot_score === 0 ? <p>No hotspots with viable targets. Great job getting out there and birding! (Try again with another list if you want)</p> :
                            <>
                              {/* @ts-expect-error temp */}
                              {job.response.slice(0, 5).map((hotspot) => (
                                <>
                                  <li key={hotspot.location.locId}>
                                    <p><strong>{hotspot.location.locName}</strong></p>
                                    <p><strong>BirdSpot Score:</strong> {Math.round(hotspot.birdspot_score * 100) / 100}</p>
                                    {/* @ts-expect-error temp */}
                                    <p><strong>Targets:</strong> {Object.values(hotspot.missing_species).map(arr => arr[0].comName).join(", ")}</p>
                                  </li>
                                </>
                              ))}
                            </>
                          }
                          {/* @ts-expect-error temp */}
                          <p>Used list size: {job.life_list.length}</p>
                        </ul>) : null}
                      </article>
                    </>
                  ))
                  : <p>No reports yet. Create one using the form below.</p>}
              </article>
            </section>
          </>
        ) : null}
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
