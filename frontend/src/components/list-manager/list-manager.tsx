import { $, component$, QRL, useSignal, useStore } from "@builder.io/qwik";
import { csvToJson } from "~/lib/csv";
import { FileUpload } from "../file-upload/file-upload";

import { Bird, List } from "~/lib/types";
import "./list-manager.css";

interface ListManagerProps {
    onListAdd$: QRL<(list: List) => void>;
}

export default component$(({ onListAdd$ }: ListManagerProps) => {
    const newList = useStore<Partial<List>>({});
    const error = useSignal<string>();

    const handleFileUpload = $(async (file: File) => {
        try {
            if (file.type !== "text/csv") {
                throw new Error("Please upload a valid CSV file.");
            }

            const text = await file.text();

            newList.birds = csvToJson<Bird>(text);

        } catch (err) {
            error.value = err instanceof Error ? err.message : "File upload failed.";
            return;
        }
    });

    return (
        <div class='list-manager-wrapper'>
            <section class="list-actions">
                <div class="list-add">
                    <form>
                        <label for="list-add-name">List Name: </label>
                        <input id="list-add-name" name="name" onInput$={(e) => newList.name = (e.target as HTMLInputElement).value}></input>
                        <label for="list-add-type">List Type: </label>
                        <input id="list-add-type" name="type" placeholder="World, ABA, NY, etc." onInput$={(e) => newList.type = (e.target as HTMLInputElement).value}></input>
                        <FileUpload onFileSelect$={handleFileUpload} />
                        <p style={{ margin: "0.4rem" }}></p>
                        <button type="button" onClick$={$(() => {
                            onListAdd$(newList as List);
                        })}>Add</button>
                    </form>
                </div>
                {error.value ?
                    <div class="list-add-error">
                        <p>{error.value}</p>
                    </div>
                    : null
                }
            </section>
        </div>
    )
})