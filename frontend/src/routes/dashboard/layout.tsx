import { $, component$, createContextId, Slot, useContext, useContextProvider, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { RequestHandler, routeLoader$ } from '@builder.io/qwik-city';

import NavLink from '~/components/nav-link/nav-link';

import useLocalstorage from '~/hooks/use-localstorage';

import { List } from '~/lib/types';
import styles from "./dashboard.module.scss";
import { ListsContext, SettingsContext } from '../layout';

export const onGet: RequestHandler = async ({ cacheControl, cookie, redirect }) => {
    cacheControl({
        public: false,
        noCache: true,
        noStore: true,
        maxAge: 0,
    });

    if (!cookie.get("jwt")?.value) {
        throw redirect(307, "/signin/");
    }
};

export const useIsLoggedIn = routeLoader$(async ({ cookie }) => {
    return !!cookie.get("jwt");
})

export default component$(() => {
    useContextProvider(SettingsContext, useStore({}));

    const listsBacking = useLocalstorage<List[]>({ key: "birdspot.lists", transform$: $((data: string | undefined) => data ? JSON.parse(data) : []) })
    useContextProvider(ListsContext, useStore({ lists: listsBacking.value ?? [] }));
    const listContext = useContext(ListsContext);

    useVisibleTask$(({ track }) => {
        track(() => listsBacking.value);
        listContext.lists = listsBacking.value ?? [];
    })

    return (
        <div id="root">
            <div class={styles.container}>
                <aside>
                    <ul>
                        <NavLink href="/dashboard" activeClass="active"><li>Overview</li></NavLink>
                        <NavLink href="/dashboard/lists" activeClass="active"><li>Lists</li></NavLink>
                        <NavLink href="/dashboard/map" prefetch={false} activeClass="active"><li>Map</li></NavLink>
                        <NavLink href="/dashboard/trips" activeClass="active"><li>Trips</li></NavLink>
                        <NavLink href="/dashboard/alerts" activeClass="active"><li>Alerts</li></NavLink>
                        <NavLink href="/dashboard/settings" activeClass="active"><li>Settings</li></NavLink>
                    </ul>
                </aside>
                <div class={styles.content}>
                    <Slot />
                </div>
            </div>
        </div>
    );
});