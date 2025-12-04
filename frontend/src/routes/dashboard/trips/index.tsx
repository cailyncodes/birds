import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
    return <div>
        <h2>Trips</h2>
            <p>Coming soon - find ideal spots across days/locations.</p>
        {/* <article>
            
        </article> */}
    </div>
});

export const head: DocumentHead = {
  title: "BirdSpot - Trips",
  meta: [
    {
      name: "description",
      content: "Make finding birds easier",
    },
  ],
};
