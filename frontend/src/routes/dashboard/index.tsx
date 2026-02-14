import { $, component$, useSignal, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

import useLocalstorage from "~/hooks/use-localstorage";
import styles from "./dashboard.module.scss";
import { ListsContext } from "../layout";
import type { List } from "~/lib/types";
import RegionSelector from "~/components/region-selector/region-selector";

interface Job {
  id: string;
  state: "running" | "completed" | "failed";
  region_code: string;
  region_name: string | null;
  target_date: string;
  life_list: string[];
  life_list_name: string | null;
  response?: {
    birdspot_score: number;
    location: { locId: string; locName: string };
    missing_species: Record<string, Array<{ comName: string }>>;
  }[];
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default component$(() => {
  const onboardingComplete = useLocalstorage({ key: "birdspot.onboarding" });
  const defaultRegion = useLocalstorage<string>({ key: "birdspot.defaults.region" });
  const lists = useContext(ListsContext)
  const showForm = useSignal(false);
  const jobs = useSignal<Job[]>([]);
  const selectedList = useSignal("");
  const targetDate = useSignal("");
  const regionCode = useSignal("");
  const isSubmitting = useSignal(false);
  const toasts = useSignal<Toast[]>([]);

  const showToast = $((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts.value = [...toasts.value, { id, message, type }];
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    }, 4000);
  });

  useVisibleTask$(({ track }) => {
    track(() => showForm.value);
    if (showForm.value && !regionCode.value && defaultRegion.value) {
      regionCode.value = defaultRegion.value;
    }
  });

  const handleSubmit = $(async () => {
    const lifeList = lists.lists.find(list => list.name === selectedList.value);
    if (!lifeList) {
      await showToast(`Life list "${selectedList.value}" not found in local storage`, "error");
      return;
    }

    isSubmitting.value = true;
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
          life_list_name: selectedList.value,
          target_date: targetDate.value,
        }),
      });

      if (response.ok) {
        await response.json();
        await showToast(`Report created successfully!`, "success");
        showForm.value = false;
        selectedList.value = "";
        regionCode.value = "";
        targetDate.value = "";
        // Refresh jobs list
        const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/jobs`, {
          headers: {
            Authorization: `Bearer ${(await window.cookieStore.get("jwt"))?.value || ""}`,
            Accept: "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          jobs.value = data;
        }
      } else {
        const errorText = await response.text();
        await showToast(`Failed to create report: ${errorText}`, "error");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      await showToast(`Error creating report: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
    } finally {
      isSubmitting.value = false;
    }
  });
  const sortedJobs = jobs.value.slice().sort((a, b) => {
    const dateA = new Date(a.target_date).getTime();
    const dateB = new Date(b.target_date).getTime();
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    const regionA = (a.region_name || a.region_code).toLowerCase();
    const regionB = (b.region_name || b.region_code).toLowerCase();
    return regionA.localeCompare(regionB);
  });
  useVisibleTask$(async () => {
    const jwt = (await window.cookieStore.get("jwt"))?.value || "";
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/jobs`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/json",
      },
    });
    if (res.ok) {
      const data: Job[] = await res.json();
      jobs.value = data;
    }
  });

  const ToastContainer = component$(() => {
    return (
      <div class="toast-container">
        {toasts.value.map((toast) => (
          <div key={toast.id} class={`toast toast-${toast.type}`}>
            <span class="toast-icon">
              {toast.type === "success" && "✓"}
              {toast.type === "error" && "✕"}
              {toast.type === "info" && "ℹ"}
            </span>
            <span class="toast-message">{toast.message}</span>
            <button
              class="toast-close"
              onClick$={() => {
                toasts.value = toasts.value.filter(t => t.id !== toast.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  });

  return (
    <div>
      <ToastContainer />
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
                {!showForm.value ? <article class={styles.article}>
                  <h3>Create reports</h3>
                  <p>Set up custom report to find birds more easily. Click "Add report" to get started.</p>
                  <div class={styles["button-wrapper"]}>
                    <button onClick$={() => showForm.value = true}>Add report</button>
                  </div>
                </article> : null}
                {showForm.value && (
                  <div class="modal-overlay" onClick$={() => showForm.value = false}>
                    <section class="modal-content" onClick$={(e) => e.stopPropagation()}>
                      <article class={styles.article}>
                        <div class="modal-header">
                          <h3>Create New Report</h3>
                        </div>
                        <form
                          action="#"
                          onSubmit$={$(async (e) => {
                            e.preventDefault();
                            await handleSubmit();
                            return false;
                          })}
                        >
                          <div class={styles["form-group"]}>
                            <label for="list-select">
                              Life List<span class={styles.required}>*</span>
                            </label>
                            <select
                              id="list-select"
                              value={selectedList.value}
                              onChange$={(e) => selectedList.value = (e.target as HTMLSelectElement).value}
                              required
                            >
                              <option value="" disabled>Select a list</option>
                              {lists.lists.map((list: List) => (
                                <option key={list.name} value={list.name}>
                                  {`${list.name} (${list.birds.length} species)`}
                                </option>
                              ))}
                            </select>
                            <span class={styles["help-text"]}>
                              Choose a life list to find target species at nearby hotspots
                            </span>
                          </div>
                          <div class={styles["form-group"]}>
                            <RegionSelector selectedRegionCode={regionCode} required={true} />
                            <span class={styles["help-text"]}>
                              Search for a country and region to automatically fill the code
                            </span>
                          </div>
                          <div class={styles["form-group"]}>
                            <label for="target-date">
                              Target Date<span class={styles.required}>*</span>
                            </label>
                            <input
                              id="target-date"
                              type="date"
                              value={targetDate.value}
                              onInput$={(e) => targetDate.value = (e.target as HTMLInputElement).value}
                              required
                            />
                            <span class={styles["help-text"]}>
                              The date you plan to go birding. Hotspots are scored based on recent sightings.
                            </span>
                          </div>
                          <div class={styles["form-actions"]}>
                            <button type="submit" disabled={isSubmitting.value}>
                              {isSubmitting.value ? "Creating..." : "Create Report"}
                            </button>
                            <button
                              type="button"
                              class={styles["button-secondary"]}
                              onClick$={() => {
                                showForm.value = false;
                                selectedList.value = "";
                                regionCode.value = "";
                                targetDate.value = "";
                              }}
                              disabled={isSubmitting.value}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </article>
                    </section>
                  </div>
                )}
              </section>
            </>

            <section>
              <article>
                <h3>My Reports</h3>
                {sortedJobs.length > 0 ?
                  sortedJobs.map((job) => (
                    <article key={job.id} class={styles.article}>
                      {job.state === "running" ? (
                        <div class={styles["job-loading"]}>
                          <span class={`${styles["status-badge"]} ${styles["status-running"]}`}>Running</span>
                          <span>{job.region_name || job.region_code} on {new Date(Date.parse(job.target_date) + 86400000).toLocaleDateString()}</span>
                          <p>Report is being generated...</p>
                        </div>
                      ) : null}
                      {job.state === "completed" && job.response ? (
                        <div>
                          <div class={styles["job-header"]}>
                            <h4>{job.region_name || job.region_code} on {new Date(Date.parse(job.target_date) + 86400000).toLocaleDateString()}</h4>
                            <span class={`${styles["status-badge"]} ${styles["status-completed"]}`}>Completed</span>
                          </div>
                          {job.response.length === 0 || job.response[0].birdspot_score === 0 ? (
                            <p class={styles["no-results"]}>No hotspots with viable targets. Great job getting out there and birding! (Try again with another list if you want)</p>
                          ) : (
                            <ul class={styles["hotspots-list"]}>
                              {job.response.slice(0, 5).map((hotspot, idx) => (
                                <li key={hotspot.location.locId} class={`${styles["hotspot-item"]} ${idx === 0 ? styles["top-spot"] : ""}`}>
                                  <div class={styles["hotspot-header"]}>
                                    <strong>{hotspot.location.locName}</strong>
                                    {idx === 0 && <span class={styles["top-badge"]}>Top Pick</span>}
                                  </div>
                                  <div class={styles["hotspot-score"]}>
                                    <span class={styles["score-label"]}>BirdSpot Score:</span>
                                    <span class={styles["score-value"]}>{Math.round(hotspot.birdspot_score * 100) / 100}</span>
                                  </div>
                                  <div class={styles["hotspot-targets"]}>
                                    <span class={styles["targets-label"]}>Targets:</span>
                                    <span class={styles["targets-value"]}>
                                      {Object.values(hotspot.missing_species).map(arr => arr[0].comName).join(", ")}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                          <p class={styles["list-info"]}>Used list: {job.life_list_name || "Life List"} ({job.life_list.length} species)</p>
                        </div>
                      ) : null}
                      {job.state === "failed" ? (
                        <div class={styles["error-text"]}>
                          <span class={`${styles["status-badge"]} ${styles["status-failed"]}`}>Failed</span>
                          <p>Report generation failed. Please try again.</p>
                        </div>
                      ) : null}
                    </article>
                  ))
                  : <p class={styles["no-reports"]}>No reports yet. Create one using the form below.</p>}
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
