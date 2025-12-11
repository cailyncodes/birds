import { $, QRL, Signal, useOnWindow, useSignal, useVisibleTask$ } from "@builder.io/qwik";


interface UseLocalStorageArguments<T> {
    key: string;
    transform$?: QRL<(data?: string) => T | undefined>
}

export default function useLocalStorage<T>({ key, transform$ = $((data?: string) => data as T) as QRL<(data?: string) => T | undefined> }: UseLocalStorageArguments<T>): Signal<T | undefined> {
    const signal = useSignal<T>();
    useOnWindow("localstorageupdate", $(async (e: CustomEvent) => {
        if (e.detail?.key != key) { return; }
        const data = window.localStorage.getItem(key) ?? undefined
        signal.value = await transform$(data);
    }));

    useVisibleTask$(async () => {
        const data = window.localStorage.getItem(key) ?? undefined
        signal.value = await transform$(data);
    }, { strategy: 'document-ready' })

    return signal;
};