import { component$, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { SettingsContext } from "~/routes/layout";
import useAuth from "../../hooks/use-auth";

export default component$(() => {
    const settings = useContext(SettingsContext);
    const ebirdToken = useAuth();

    useVisibleTask$(({ track }) => {
        track(() => ebirdToken.value)
        settings.apiKeys = {ebird: ebirdToken.value ?? ""}
    })
    
    return (
        <>
            <p>In order to provide this service to many people (and to respect eBird's Terms of Service), we need users to provide their own API keys. It is free and very easy to get an eBird API token. We never store your key! All token data is stored on your device, and we only use it as part of network requests to our servers to proxy requests to eBird APIs.</p>
            <div>
                <label for="ebird-apikey">Your eBird API Key: </label>
                <input id="ebird-apikey" name="ebird-apikey" type="text" placeholder="Enter your eBird API Key" defaultValue={settings?.apiKeys?.ebird as string ?? ""} onInput$={
                    (event: InputEvent) => {
                        window.localStorage.setItem("ebird-api-token", (event.target as HTMLInputElement).value);
                        window.dispatchEvent(new CustomEvent("localstorageupdate", { detail: { key: "ebird-api-token" }}))
                    }
                } />
                <p>
                    <em>You can find or create your eBird API Key <a href="https://ebird.org/api/keygen" target="_blank" rel="noopener noreferrer">here</a>. The form linked there is very short and you will immediately get your API Key.</em>
                </p>
            </div>
        </>
    )
});