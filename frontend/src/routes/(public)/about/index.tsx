import { component$ } from "@builder.io/qwik";
import { type DocumentHead, Link } from "@builder.io/qwik-city";
import styles from "./about.module.scss";

export default component$(() => {
  return (
    <div class={styles.about}>
      <section class={styles.hero}>
        <div class={styles.heroContent}>
          <h1>The missing features of eBird.</h1>
          <p class={styles.lead}>
            eBird is an incredible resource, but it doesn't do everything. BirdSpot fills in the
            gaps with features designed to make your birding more productive and enjoyable.
          </p>
        </div>
      </section>

      <section class={styles.section}>
        <div class={styles.container}>
          <h2>What is BirdSpot?</h2>
          <p>
            BirdSpot is a free tool built for birders who want to get more out of their eBird data.
            We help you find the best spots to see the birds you're looking for—whether that's in
            your local patch or on a trip across the world.
          </p>
        </div>
      </section>

      <section class={styles.sectionAlt}>
        <div class={styles.container}>
          <h2>Features</h2>
          <div class={styles.features}>
            <article class={styles.feature}>
              <div class={styles.featureIcon}>🎯</div>
              <h3>BirdSpot Score</h3>
              <p>
                Compare hotspots based on your personal life list. Our scoring algorithm uses
                recent eBird checklist data to show you where you're most likely to find new birds.
              </p>
            </article>

            <article class={styles.feature}>
              <div class={styles.featureIcon}>🔔</div>
              <h3>Daily Alerts</h3>
              <p>
                Get a daily report of the best hotspots in your region, customized to your
                lists and preferences.
              </p>
            </article>

            <article class={styles.feature}>
              <div class={styles.featureIcon}>✈️</div>
              <h3>Trip Planning</h3>
              <p>
                Planning a birding trip? Find the ideal hotspots across multiple days and
                locations to maximize your target species.
              </p>
            </article>

            <article class={styles.feature}>
              <div class={styles.featureIcon}>📝</div>
              <h3>List Management</h3>
              <p>
                Import and manage your life lists, target lists, and any other custom lists
                you want to track.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class={styles.section}>
        <div class={styles.container}>
          <h2>How It Works</h2>
          <p>
            BirdSpot connects to the eBird API to access the latest birding data. To use BirdSpot,
            you'll need a free{" "}
            <a href="https://ebird.org/api/keygen" target="_blank" rel="noopener noreferrer">
              eBird API key
            </a>
            . Once connected, you can import your eBird lists and start exploring hotspots
            tailored to your birding goals.
          </p>
        </div>
      </section>

      <section class={styles.cta}>
        <div class={styles.container}>
          <h2>Free Forever</h2>
          <p>
            BirdSpot is and always will be free to use. We're birders building tools for other birders.
            If you find BirdSpot helpful, consider{" "}
            <Link href="/donate/">supporting the project</Link>—10% of donations go to eBird,
            and another 10% goes to environmental conservation organizations.
          </p>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: "About - BirdSpot",
  meta: [
    {
      name: "description",
      content: "BirdSpot is the missing features of eBird. Compare hotspots, plan trips, and find the birds you're looking for.",
    },
  ],
};
