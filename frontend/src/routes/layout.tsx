import { $, component$, createContextId, Slot, useContext, useContextProvider, useStore, useVisibleTask$, useSignal, Fragment } from '@builder.io/qwik';
import useLocalstorage from '~/hooks/use-localstorage';

import styles from "./index.module.scss";
import { Link, RequestHandler, routeLoader$, useLocation } from '@builder.io/qwik-city';
import { doSignIn } from '~/lib/auth';

export const onGet: RequestHandler = async ({ cookie }) => {
    const jwt = cookie.get("jwt")?.value
    if (!jwt) {
        return;
    }

    // Attempt to sign in using the current jwt.
    // If not valid, delete the cookie to signal to downstream
    // routes that the user is not logged in.
    const response = await doSignIn({ jwt });
    if (response.status !== 200) {
        cookie.delete("jwt")
        return;
    }
}

export interface Bird {
    "Taxon Order": string;
    "Category": string;
    "Common Name": string;
    "Scientific Name": string;
    "Count": string;
    "Location": string;
    "S/P": string;
    "Date": string;
    "LocID": string;
    "SubID": string;
    "Exotic": string;
    "Countable": string;
}

export interface List {
    name: string;
    type: string;
    birds: Bird[];
}

export const UserContext = createContextId<User>("birdspot.user");
export const SettingsContext = createContextId<Record<string, Record<string, string | boolean>>>("birdspot.settings");
export const ListsContext = createContextId<{ lists: List[] }>("birdspot.lists");

export const useIsLoggedIn = routeLoader$(async ({ cookie }) => {
    return !!cookie.get("jwt");
})

export default component$(() => {
    const isLoggedIn = useIsLoggedIn();
    const location = useLocation();
    useContextProvider(SettingsContext, useStore({}));

    const listsBacking = useLocalstorage<List[]>({ key: "birdspot.lists", transform$: $((data: string | undefined) => data ? JSON.parse(data) : []) })
    useContextProvider(ListsContext, useStore({ lists: listsBacking.value ?? [] }));
    const listContext = useContext(ListsContext);

    useVisibleTask$(({ track }) => {
        track(() => listsBacking.value);
        listContext.lists = listsBacking.value ?? [];
    })

    const isMenuOpen = useSignal(false);

    return (
        <div id="root">
            <div class={styles.header}>
                <div class={styles["header-name"]} onClick$={() => isMenuOpen.value = false}>
                    <img src="/logo.png" width="85" height="85" />
                    <h1><Link href="/">BirdSpot</Link></h1>
                </div>
                <button
                    class={styles.hamburger}
                    onClick$={() => isMenuOpen.value = !isMenuOpen.value}
                    aria-label="Toggle navigation"
                >
                    <span class={styles.bar}></span>
                    <span class={styles.bar}></span>
                    <span class={styles.bar}></span>
                </button>
                <nav class={isMenuOpen.value ? styles["mobile-nav-open"] : null}>
                    <ul>
                        <li><Link href="/" data-active={location.url.pathname == "/"}>Home</Link></li>
                        <li><Link href="/about/" data-active={location.url.pathname == "/about/"}>About</Link></li>
                        <li><Link href="/donate/" prefetch={false} data-active={location.url.pathname == "/donate/"}>Donate</Link></li>
                        {isLoggedIn.value ?
                            <li><Link href="/dashboard/" data-active={location.url.pathname == "/dashboard/"}>Dashboard</Link></li> :
                            <li><Link href="/signin/" data-active={location.url.pathname == "/signin/"}>Sign In</Link></li>
                        }
                    </ul>
                </nav>
            </div>
            <div onClick$={() => isMenuOpen.value = false}>
                <Slot />
            </div>
        </div>
    );
});