import { $, component$, useContext, useSignal } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import ListManager from "~/components/list-manager/list-manager";
import BirdListDetail from "~/components/bird-list-detail/bird-list-detail";
import { ListsContext } from "~/routes/layout";

import { List } from "~/lib/types";
import styles from "./lists.module.scss";

export default component$(() => {
    const listsContext = useContext(ListsContext);
    const selectedListName = useSignal<string | null>(null);

    const onListAdd = $((list: List) => {
        listsContext.lists.push(list);
        window.localStorage.setItem("birdspot.lists", JSON.stringify(listsContext.lists));
    })

    const onListUpdate = $((updatedList: List) => {
        const index = listsContext.lists.findIndex(l => l.name === updatedList.name);
        if (index !== -1) {
            listsContext.lists[index] = updatedList;
            window.localStorage.setItem("birdspot.lists", JSON.stringify(listsContext.lists));
        }
    })

    const openList = $((list: List) => {
        selectedListName.value = list.name;
    });

    const closeList = $(() => {
        selectedListName.value = null;
    });

    return (
        <div class={styles.container}>
            <div class={styles.header}>
                <div class={styles.titleArea}>
                    <h2>My Lists</h2>
                    <p>Manage your birding lists and life lists</p>
                </div>
            </div>
            
            <main>
                {listsContext.lists.length === 0 ? (
                    <div class={styles.emptyState}>
                        <div class={styles.emptyIcon}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M20 7h-9" />
                                <path d="M14 17H5" />
                                <circle cx="17" cy="17" r="3" />
                                <circle cx="7" cy="7" r="3" />
                            </svg>
                        </div>
                        <h3>No lists yet</h3>
                        <p>Create your first birding list to start tracking the birds you've seen.</p>
                    </div>
                ) : (
                    <section class={styles.lists}>
                        {listsContext.lists.map((list) => {
                            return (
                                <article class={styles.listCard} key={list.name}>
                                    <div class={styles.cardHeader}>
                                        <div class={styles.listInfo}>
                                            <h3 class={styles.listName}>{list.name}</h3>
                                            <span class={styles.listType}>{list.type}</span>
                                        </div>
                                    </div>
                                    <div class={styles.cardStats}>
                                        <div class={styles.stat}>
                                            <span class={styles.statValue}>{list.birds.length}</span>
                                            <span class={styles.statLabel}>Birds</span>
                                        </div>
                                    </div>
                                    <div class={styles.cardActions}>
                                        <button 
                                            class={styles.viewBtn}
                                            onClick$={() => openList(list)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            View Birds
                                        </button>
                                        <button 
                                            class={styles.deleteBtn}
                                            onClick$={() => {
                                                listsContext.lists = listsContext.lists.filter((l => l.name !== list.name));
                                                window.localStorage.setItem("birdspot.lists", JSON.stringify(listsContext.lists));
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </article>
                            )
                        })}
                    </section>
                )}
                
                <section class={styles.addList}>
                    <article class={styles.addCard}>
                        <div class={styles.addHeader}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            <h3>Add New List</h3>
                        </div>
                        <ListManager onListAdd$={onListAdd} />
                    </article>
                </section>
            </main>

            {selectedListName.value && (
                <BirdListDetail 
                    listName={selectedListName.value} 
                    onClose$={closeList}
                    onUpdate$={onListUpdate}
                />
            )}
        </div>
    )
})

export const head: DocumentHead = {
    title: "BirdSpot - Lists",
    meta: [
        {
            name: "description",
            content: "Make finding birds easier",
        },
    ],
};
