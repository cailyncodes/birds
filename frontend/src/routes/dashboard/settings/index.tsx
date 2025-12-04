import { component$ } from "@builder.io/qwik";

import AdditionalTaxa from "~/components/additional-taxa/additional-taxa";
import DefaultRegion from "~/components/default-region/default-region";
import EBirdApiKey from "~/components/ebird-api-key/ebird-api-key";

import "./settings.css";
import { DocumentHead } from "@builder.io/qwik-city";

interface SettingsProps {
}

export default component$(({ }: SettingsProps) => {
    return <div>
        <h2>Settings</h2>
        <p>Manage all your account settings here</p>
        <section>
            <article>
                <h3>API Keys</h3>
                <EBirdApiKey />
            </article>
            <article>
                <h3>Default Region</h3>
                <DefaultRegion />
            </article>
            <article>
                <h3>Additional Taxa</h3>
                <AdditionalTaxa />
            </article>
        </section>
    </div>
})

export const head: DocumentHead = {
    title: "BirdSpot - Settings",
    meta: [
        {
            name: "description",
            content: "Make finding birds easier",
        },
    ],
};
