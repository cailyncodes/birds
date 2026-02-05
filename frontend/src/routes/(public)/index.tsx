import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

import styles from "./index.module.scss";

export default component$(() => {
  return (
    <main>
      <section class={styles.hero}>
        <div class={styles["hero-overlay"]} />
        <div class={styles["hero-content"]}>
          <h1 class={styles.headline}>Welcome!</h1>
          <p class={styles.subheadline}>BirdSpot makes finding birds <em>easier.</em></p>
        </div>
        <div class={styles["photo-credits"]}>Photo credits to <a>Jenna Tishler</a></div>
      </section>
      <article class={styles.blocks}>
        <section class={styles.block}>
          <h2>Compare hotspots</h2>
          <p>The BirdSpot Score is computed using recent eBird checklist data  and allows you to compare hotspots based on your life list.</p>
        </section>
        <section class={[styles.block, styles["block-empty"]]} />
        <section class={[styles.block, styles["block-empty"]]} />
        <section class={styles.block}>
          <h2>Daily spots near your home</h2>
          <p>Get a daily report of the best hotspots in your region based on BirdSpot Score.</p>
        </section>
        <section class={styles.block}>
          <h2>Plan trips to maximize targets</h2>
          <p>Find the best hotspots in any region around the world to help you plan trips to new regions.</p>
        </section>
        <section class={[styles.block, styles["block-empty"]]} />
      </article>
      <section>
        <div class={styles.callout}>
          <p class={styles["callout-header"]}>…and entirely FREE!</p>
          <p class={styles["callout-subtitle"]}><Link href="/donate">Donations</Link> are always appreciated :)</p>
        </div>
      </section>
      <section>
        <div class={styles.action}>
          <p><Link href="/signin">Create your account</Link> today to get started!</p>
        </div>
      </section>
    </main>
  )
});

export const head: DocumentHead = {
  title: "BirdSpot",
  meta: [
    {
      name: "description",
      content: "BirdSpot makes finding birds easier",
    },
  ],
};
