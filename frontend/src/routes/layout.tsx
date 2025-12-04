import { $, component$, createContextId, Slot, useContext, useContextProvider, useStore, useVisibleTask$ } from '@builder.io/qwik';
import Header from '~/components/header/header';
import useLocalstorage from '~/components/hooks/use-localstorage';

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
export const ListsContext = createContextId<{lists: List[]}>("birdspot.lists");

export default component$(() => {
    useContextProvider(SettingsContext, useStore({}));

    const listsBacking = useLocalstorage<List[]>({ key: "birdspot.lists", transform$: $((data: string | undefined) => data ? JSON.parse(data) : [] )})
    useContextProvider(ListsContext, useStore({ lists: listsBacking.value ?? [] }));
    const listContext = useContext(ListsContext);

    useVisibleTask$(({ track }) => {
        track(() => listsBacking.value);
        listContext.lists = listsBacking.value ?? [];
    })

    return (
        <div class="root">
            <header class="header">
                <Header />
            </header>
            <div class="content">
                <Slot />
            </div>
            <footer>
                <p>@Copyright BirdSpot</p>
            </footer>
        </div>
    );
});