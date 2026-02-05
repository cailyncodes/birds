import { $, component$, useContext } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import ListManager from "~/components/list-manager/list-manager";
import { ListsContext } from "~/routes/layout";

import { List } from "~/lib/types";
import styles from "./lists.module.scss";

export default component$(() => {
    const listsContext = useContext(ListsContext);

    const onListAdd = $((list: List) => {
        listsContext.lists.push(list);
        window.localStorage.setItem("birdspot.lists", JSON.stringify(listsContext.lists));
    })

    return (
        <div class={styles.container}>
            <h2>Lists</h2>
            <p>Manage all your lists and import new ones</p>
            <main>
                <section class={styles.lists}>
                    {listsContext.lists.map((list) => {
                        return (
                            <article class="list" key={list.name}>
                                <h3 class="list-name">{list.name}</h3>
                                <div class="list-type">Type: {list.type}</div>
                                <div class="list-count">Size: {list.birds.length}</div>
                                <p style={{ margin: "0.6rem" }}></p>
                                <div class="button-wrapper">
                                    <button onClick$={$(() => {
                                        listsContext.lists = listsContext.lists.filter((l => l.name !== list.name));
                                        window.localStorage.setItem("birdspot.lists", JSON.stringify(listsContext.lists));
                                    })}>Delete</button>
                                </div>
                            </article>
                        )
                    })}
                </section>
                <section class={styles["add-list"]}>
                    <article>
                        <h3>Add list</h3>
                        <ListManager onListAdd$={onListAdd} />
                    </article>
                </section>
            </main>
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
