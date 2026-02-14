import { $, component$, Slot, useContext, useContextProvider, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { RequestHandler, routeLoader$, useLocation } from '@builder.io/qwik-city';

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

    const location = useLocation();

    useVisibleTask$(({ track }) => {
        track(() => listsBacking.value);
        listContext.lists = listsBacking.value ?? [];
    })

    const getPageTitle = () => {
        const path = location.url.pathname;
        if (path === '/dashboard/' || path === '/dashboard') return 'Overview';
        if (path.includes('/lists')) return 'Lists';
        if (path.includes('/map')) return 'Map';
        if (path.includes('/trips')) return 'Trips';
        if (path.includes('/alerts')) return 'Alerts';
        if (path.includes('/settings')) return 'Settings';
        return 'Dashboard';
    };

    return (
        <div id="root">
            <header class={styles.header}>
                <div class={styles.headerBrand}>
                    <img src="/logo.png" width="40" height="40" alt="BirdSpot logo" />
                    <h1>BirdSpot</h1>
                </div>
            </header>
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
                    <div class={styles.separator}></div>
                    <ul class={styles.externalLinks}>
                        <NavLink href="/about" activeClass="active"><li>About</li></NavLink>
                        <NavLink href="/donate" activeClass="active"><li>Donate</li></NavLink>
                    </ul>
                </aside>
                <div class={styles.content}>
                    <Slot />
                </div>
            </div>
        </div>
    );
});