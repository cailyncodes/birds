import { component$, useContext, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { SettingsContext } from "~/routes/layout";
import useLocalstorage from "../../hooks/use-localstorage";
import RegionSelector from "../region-selector/region-selector";

import styles from "./default-region.module.scss";

export default component$(() => {
    const settings = useContext(SettingsContext);
    const defaultRegion = useLocalstorage<string>({ key: "birdspot.defaults.region" });
    const editRegionDisplay = useSignal<boolean>(false);
    const regionCodeSignal = useSignal<string>("");

    useVisibleTask$(() => {
        if (defaultRegion.value) {
            regionCodeSignal.value = defaultRegion.value;
        }
    });

    useVisibleTask$(({ track }) => {
        track(() => regionCodeSignal.value);
        settings.defaults = { ...settings.defaults, region: regionCodeSignal.value ?? "" };
        defaultRegion.value = regionCodeSignal.value;
    });

    return (
        <>
            <p>Choose a default region for your daily report. This should be the location you're most likely to bird in on a daily basis.</p>
            <p>Default region: {regionCodeSignal.value || "Not set"}</p>
            <button style={{display: editRegionDisplay.value ? "none" : "block"}} onClick$={() => editRegionDisplay.value = true}>Edit</button>
            <div style={{display: editRegionDisplay.value ? "block" : "none"}} class={styles.defaultRegionEdit}>
                <RegionSelector selectedRegionCode={regionCodeSignal} required={true} />
                <button onClick$={() => editRegionDisplay.value = false}>Done</button>
            </div>
        </>
    )
});
