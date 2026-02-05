import { $, component$, createContextId, Slot, useContext, useContextProvider, useStore, useVisibleTask$ } from '@builder.io/qwik';
import useLocalstorage from '~/hooks/use-localstorage';

import { RequestHandler, routeLoader$ } from '@builder.io/qwik-city';
import { doSignIn } from '~/lib/auth';
import { List } from '~/lib/types';

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

export const UserContext = createContextId<User>("birdspot.user");
export const SettingsContext = createContextId<Record<string, Record<string, string | boolean>>>("birdspot.settings");
export const ListsContext = createContextId<{ lists: List[] }>("birdspot.lists");

export const useIsLoggedIn = routeLoader$(async ({ cookie }) => {
    return !!cookie.get("jwt");
})

export default component$(() => {
    useContextProvider(SettingsContext, useStore({}));
    const listsBacking = useLocalstorage<List[]>({ key: "birdspot.lists", transform$: $((data: string | undefined) => data ? JSON.parse(data) : []) })
    useContextProvider(ListsContext, useStore({ lists: listsBacking.value ?? [] }));

    return (
        <Slot />
    );
});