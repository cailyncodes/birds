import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
    return <div>
        <h2>Alerts</h2>
            <p>Coming soon - better alerts for the birds you care about.</p>
        {/* <article>
            
        </article> */}
    </div>
});

export const head: DocumentHead = {
  title: "BirdSpot - Alerts",
  meta: [
    {
      name: "description",
      content: "Make finding birds easier",
    },
  ],
};
