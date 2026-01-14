import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <main class="main">
        <h2>Donate to BirdSpot</h2>
        <p>BirdSpot is a free tool for birders. If you find it useful, please consider supporting its development. You can support BirdSpot by:</p>
        <ul>
          <li>Donating via <Link href="https://buymeacoffee.com/cailyncodes" target="_blank">Buy Me a Coffee</Link></li>
          <li>Sharing the tool with other birders</li>
          <li>Providing feedback to improve the experience</li>
        </ul>
        <p>Donations not only go to BirdSpot! 10% is dedicated to eBird to support their conservation efforts and technical infrastructure that enables BirdSpot. An additional 10% is donated to an environmental conservation organization, chosen on a monthyly rotating basis.</p>
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
