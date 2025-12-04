import { $, component$, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { SettingsContext } from "~/routes/layout";
import useLocalstorage from "../hooks/use-localstorage";

export default component$(() => {
    const settings = useContext(SettingsContext);
    const defaultAdditionalTaxa = useLocalstorage<boolean>({ key: "birdspot.defaults.additional-taxa", transform$: $((value?: string) => value === "Yes") });

    useVisibleTask$(({ track }) => {
        track(() => defaultAdditionalTaxa.value)
        settings.defaults = {...settings.defaults, additionalTaxa: defaultAdditionalTaxa.value ?? ""}
    })
    
    return (
        <>
            <p>Select whether you want to count non-species taxa towards BirdSpot scores.</p>
            <div>
                <label for="additional-taxa">Include non-species taxa: </label>
                <input id="additional-taxa" name="additional-taxa" type="checkbox" defaultChecked={settings?.defaults?.additionalTaxa as boolean} onChange$={
                    (event: InputEvent) => {
                        window.localStorage.setItem("birdspot.defaults.additional-taxa", (event.target as HTMLInputElement).checked ? "Yes" : "No");
                        window.dispatchEvent(new CustomEvent("localstorageupdate", { detail: { key: "birdspot.defaults.additional-taxa" }}))
                    }
                } />
                &nbsp;({defaultAdditionalTaxa.value ? "Yes" : "No"})
                <p><em>If you are unsure, you should leave this unchecked.</em></p>
            </div>
        </>
    )
});