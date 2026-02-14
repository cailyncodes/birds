import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

import styles from "./index.module.scss";

export default component$(() => {
  return (
    <main>
      <section class={styles.hero}>
        <div class={styles["hero-overlay"]} />
        <div class={styles["hero-content"]}>
          <h1 class={styles.headline}>BirdSpot makes finding birds easier.</h1>
          <p class={styles.subheadline}>
            The best hotspots based on <em>your</em> life list.
          </p>
          <div class={styles["hero-cta"]}>
            <Link href="/signin" class={styles["cta-button"]}>
              Get Started
            </Link>
            <Link href="/about" class={styles["cta-link"]}>
              Learn More →
            </Link>
          </div>
        </div>
        <div class={styles["photo-credits"]}>Photo credits to Jenna Tishler</div>
      </section>

      <section class={styles.features}>
        <div class={styles["section-header"]}>
          <h2>Everything You Need to Find More Birds</h2>
          <p>Powerful features built on top of eBird's incredible data</p>
        </div>
        <div class={styles["features-grid"]}>
          <article class={styles.feature}>
            <div class={styles["feature-icon"]}>🎯</div>
            <h3>BirdSpot Score</h3>
            <p>Our proprietary scoring algorithm analyzes recent eBird data to show you exactly where you are most likely to find new birds for your life list.</p>
          </article>
          <article class={styles.feature}>
            <div class={styles["feature-icon"]}>🔔</div>
            <h3>Daily Alerts</h3>
            <p>Get a personalized daily report of the best hotspots in your region, ranked by your unique BirdSpot Score and tailored to your target species.</p>
          </article>
          <article class={styles.feature}>
            <div class={styles["feature-icon"]}>✈️</div>
            <h3>Trip Planning</h3>
            <p>Planning a birding adventure? Find the optimal hotspots across multiple days and locations to maximize your target species on any trip.</p>
          </article>
        </div>
      </section>

      <section class={styles.steps}>
        <div class={styles["section-header"]}>
          <h2>Get Started in 3 Easy Steps</h2>
          <p>From signup to your first BirdSpot report in minutes</p>
        </div>
        <div class={styles["steps-grid"]}>
          <div class={styles.step}>
            <div class={styles["step-number"]}>1</div>
            <h3>Create Account</h3>
            <p>Sign up free and connect your eBird account with your API key</p>
          </div>
          <div class={styles.step}>
            <div class={styles["step-number"]}>2</div>
            <h3>Import Lists</h3>
            <p>Import your life list and any target species lists you want to track</p>
          </div>
          <div class={styles.step}>
            <div class={styles["step-number"]}>3</div>
            <h3>Discover Hotspots</h3>
            <p>Get personalized hotspot recommendations based on your unique birding goals</p>
          </div>
        </div>
      </section>

      <section class={styles.stats}>
        <div class={styles["stats-grid"]}>
          <div class={styles.stat}>
            <div class={styles["stat-number"]}>100%</div>
            <div class={styles["stat-label"]}>Free Forever</div>
          </div>
          <div class={styles.stat}>
            <div class={styles["stat-number"]}>Global</div>
            <div class={styles["stat-label"]}>eBird Data</div>
          </div>
          <div class={styles.stat}>
            <div class={styles["stat-number"]}>Daily</div>
            <div class={styles["stat-label"]}>Personalized Alerts</div>
          </div>
        </div>
      </section>

      <section class={styles["final-cta"]}>
        <div class={styles["final-cta-content"]}>
          <h2>Ready to Find More Birds?</h2>
          <p>Join the birders already using BirdSpot to maximize their birding adventures.</p>
          <Link href="/signin" class={styles["cta-button-large"]}>
            Get Started →
          </Link>
          <p class={styles["final-cta-sub"]}>
            Built by birders, for birders.
          </p>
        </div>
      </section>
    </main>
  )
});

export const head: DocumentHead = {
  title: "BirdSpot - Find More Birds",
  meta: [
    {
      name: "description",
      content: "BirdSpot helps you find more birds with personalized hotspot recommendations based on your life list. Free daily alerts, trip planning, and more.",
    },
  ],
};
