import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <main class="main">
        <h2><em>The missing features of eBird.</em></h2>
        <p>TODO</p>
        <script type="text/javascript" src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" data-name="bmc-button" data-slug="cailyncodes" data-color="#72452d" data-emoji="🐣"  data-font="Inter" data-text="Support BirdSpot" data-outline-color="#ffffff" data-font-color="#ffffff" data-coffee-color="#FFDD00" ></script>
      </main>
    </>
  )
});

export const head: DocumentHead = {
  title: "BirdSpot",
  meta: [
    {
      name: "description",
      content: "The travel birders best friend—find birds you haven't seen yet when traveling!",
    },
  ],
};
