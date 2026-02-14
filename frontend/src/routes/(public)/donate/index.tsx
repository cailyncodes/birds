import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import styles from "./donate.module.scss";

export default component$(() => {
  return (
    <div class={styles.donate}>
      <section class={styles.hero}>
        <div class={styles.heroContent}>
          <h1>Support BirdSpot</h1>
          <p class={styles.lead}>
            BirdSpot is a free tool for birders, built by birders. 
            Your support helps keep the project alive and growing.
          </p>
        </div>
      </section>

      <section class={styles.section}>
        <div class={styles.container}>
          <h2>Ways to Support</h2>
          <div class={styles.methods}>
            <article class={styles.method}>
              <div class={styles.methodIcon}>☕</div>
              <h3>Buy Me a Coffee</h3>
              <p>
                Make a one-time or recurring donation through Buy Me a Coffee. 
                Every contribution, no matter the size, makes a difference.
              </p>
              <a 
                href="https://buymeacoffee.com/cailyncodes" 
                target="_blank" 
                rel="noopener noreferrer"
                class={styles.methodLink}
              >
                Donate Now →
              </a>
            </article>

            <article class={styles.method}>
              <div class={styles.methodIcon}>🐦</div>
              <h3>Share BirdSpot</h3>
              <p>
                Help spread the word! Share BirdSpot with your birding friends, 
                local birding clubs, and social media communities.
              </p>
            </article>

            <article class={styles.method}>
              <div class={styles.methodIcon}>💬</div>
              <h3>Provide Feedback</h3>
              <p>
                Your ideas and suggestions help us improve. Let us know what features 
                you'd like to see or report any issues you encounter.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class={styles.impact}>
        <div class={styles.container}>
          <h2>Where Your Donations Go</h2>
          <div class={styles.breakdown}>
            <div class={styles.breakdownItem}>
              <div class={styles.percentage}>80%</div>
              <div class={styles.description}>
                <h3>BirdSpot Development</h3>
                <p>Server costs, development time, and new features</p>
              </div>
            </div>
            <div class={styles.breakdownItem}>
              <div class={styles.percentage}>10%</div>
              <div class={styles.description}>
                <h3>eBird Support</h3>
                <p>Supporting the conservation efforts and infrastructure that powers BirdSpot</p>
              </div>
            </div>
            <div class={styles.breakdownItem}>
              <div class={styles.percentage}>10%</div>
              <div class={styles.description}>
                <h3>Conservation</h3>
                <p>Environmental conservation organizations (rotates monthly)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class={styles.cta}>
        <div class={styles.container}>
          <h2>Ready to Help?</h2>
          <p>
            Every donation helps keep BirdSpot free for birders everywhere. 
            Thank you for your support!
          </p>
          <div class={styles.ctaButton}>
            <script
              type="text/javascript"
              src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
              data-name="bmc-button"
              data-slug="cailyncodes"
              data-color="#72452d"
              data-emoji="🐣"
              data-font="Inter"
              data-text="Support BirdSpot"
              data-outline-color="#ffffff"
              data-font-color="#ffffff"
              data-coffee-color="#FFDD00"
            />
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Donate - BirdSpot",
  meta: [
    {
      name: "description",
      content: "Support BirdSpot - a free tool for birders. Your donations help keep the project alive.",
    },
  ],
};
