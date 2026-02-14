import { $, component$, useSignal, useStore, useComputed$, useContext, type QRL } from "@builder.io/qwik";

import { Bird, List } from "~/lib/types";
import { ListsContext } from "~/routes/layout";
import styles from "./bird-list-detail.module.scss";

interface BirdListDetailProps {
    listName: string;
    onClose$: QRL<() => void>;
    onUpdate$: QRL<(updatedList: List) => void>;
}

export default component$(({ listName, onClose$, onUpdate$ }: BirdListDetailProps) => {
    const listsContext = useContext(ListsContext);

    const searchQuery = useSignal("");
    const editingBirdIndex = useSignal<number | null>(null);
    const editingBird = useStore<Record<string, string>>({});
    const expandedBird = useSignal<number | null>(null);

    const filteredBirds = useComputed$(() => {
        const list = listsContext.lists.find(l => l.name === listName);
        if (!list || !list.birds) return [];
        const query = searchQuery.value.toLowerCase().trim();
        if (!query) return list.birds;
        return list.birds.filter(bird =>
            bird["Common Name"]?.toLowerCase().includes(query) ||
            bird["Scientific Name"]?.toLowerCase().includes(query) ||
            bird["Location"]?.toLowerCase().includes(query)
        );
    });

    const startEdit = $((index: number) => {
        const list = listsContext.lists.find(l => l.name === listName);
        if (!list) return;
        const bird = list.birds[index];
        editingBirdIndex.value = index;
        Object.assign(editingBird, bird);
    });

    const cancelEdit = $(() => {
        editingBirdIndex.value = null;
        Object.keys(editingBird).forEach(key => delete editingBird[key]);
    });

    const saveEdit = $(async (index: number) => {
        const list = listsContext.lists.find(l => l.name === listName);
        if (!list) return;
        const updatedBirds = [...list.birds];
        updatedBirds[index] = { ...updatedBirds[index], ...editingBird } as Bird;
        
        await onUpdate$({
            ...list,
            birds: updatedBirds
        });
        
        editingBirdIndex.value = null;
        Object.keys(editingBird).forEach(key => delete editingBird[key]);
    });

    const deleteBird = $(async (index: number) => {
        const list = listsContext.lists.find(l => l.name === listName);
        if (!list) return;
        const updatedBirds = list.birds.filter((_, i) => i !== index);
        await onUpdate$({
            ...list,
            birds: updatedBirds
        });
        
        if (expandedBird.value === index) {
            expandedBird.value = null;
        } else if (expandedBird.value !== null && expandedBird.value > index) {
            expandedBird.value = expandedBird.value - 1;
        }
    });

    const toggleExpand = $((index: number) => {
        expandedBird.value = expandedBird.value === index ? null : index;
    });

    const birdFields: { key: keyof Bird; label: string }[] = [
        { key: "Common Name", label: "Common Name" },
        { key: "Scientific Name", label: "Scientific Name" },
        { key: "Category", label: "Category" },
        { key: "Count", label: "Count" },
        { key: "Location", label: "Location" },
        { key: "Date", label: "Date" },
        { key: "S/P", label: "S/P" },
        { key: "Exotic", label: "Exotic" },
        { key: "Countable", label: "Countable" },
        { key: "Taxon Order", label: "Taxon Order" },
        { key: "LocID", label: "LocID" },
        { key: "SubID", label: "SubID" },
    ];

    const list = listsContext.lists.find(l => l.name === listName);
    if (!list) {
        return (
            <div class={styles.overlay} onClick$={() => onClose$()}>
                <div class={styles.modal} onClick$={(e) => e.stopPropagation()}>
                    <div class={styles.empty}>List not found</div>
                </div>
            </div>
        );
    }

    return (
        <div class={styles.overlay} onClick$={() => onClose$()}>
            <div class={styles.modal} onClick$={(e) => e.stopPropagation()}>
                <header class={styles.header}>
                    <div class={styles.titleSection}>
                        <h2>{list.name}</h2>
                        <span class={styles.badge}>{list.type}</span>
                    </div>
                    <button class={styles.closeBtn} onClick$={() => onClose$()} aria-label="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div class={styles.toolbar}>
                    <div class={styles.searchWrapper}>
                        <svg class={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search birds..."
                            value={searchQuery.value}
                            onInput$={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
                            class={styles.searchInput}
                        />
                    </div>
                    <span class={styles.count}>
                        {filteredBirds.value.length} {filteredBirds.value.length === 1 ? "bird" : "birds"}
                        {searchQuery.value && ` (of ${list.birds.length})`}
                    </span>
                </div>

                <div class={styles.list}>
                    {filteredBirds.value.length === 0 ? (
                        <div class={styles.empty}>
                            {searchQuery.value ? "No birds match your search" : "No birds in this list"}
                        </div>
                    ) : (
                        filteredBirds.value.map((bird) => {
                            const actualIndex = list.birds.indexOf(bird);
                            const isEditing = editingBirdIndex.value === actualIndex;
                            const isExpanded = expandedBird.value === actualIndex;

                            return (
                                <div key={bird["Common Name"]} class={[styles.birdCard, isExpanded && styles.expanded].filter(Boolean).join(" ")}>
                                    <div class={styles.birdHeader} onClick$={() => toggleExpand(actualIndex)}>
                                        <div class={styles.birdMain}>
                                            <span class={styles.commonName}>{bird["Common Name"]}</span>
                                            <span class={styles.scientificName}>{bird["Scientific Name"]}</span>
                                        </div>
                                        <div class={styles.birdActions}>
                                            <button 
                                                class={styles.actionBtn}
                                                onClick$={(e) => {
                                                    e.stopPropagation();
                                                    startEdit(actualIndex);
                                                }}
                                                aria-label="Edit bird"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button 
                                                class={[styles.actionBtn, styles.deleteBtn].filter(Boolean).join(" ")}
                                                onClick$={(e) => {
                                                    e.stopPropagation();
                                                    deleteBird(actualIndex);
                                                }}
                                                aria-label="Delete bird"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                            <svg 
                                                class={[styles.expandIcon, isExpanded && styles.rotated].filter(Boolean).join(" ")} 
                                                width="20" 
                                                height="20" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                stroke-width="2"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div class={styles.birdDetails}>
                                            {isEditing ? (
                                                <div class={styles.editForm}>
                                                    <div class={styles.editGrid}>
                                                        {birdFields.slice(0, 6).map(field => (
                                                            <div key={field.key as string} class={styles.fieldGroup}>
                                                                <label>{field.label}</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingBird[field.key as string] ?? ""}
                                                                    onInput$={(e) => {
                                                                        editingBird[field.key as string] = (e.target as HTMLInputElement).value;
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div class={styles.editActions}>
                                                        <button class={styles.cancelBtn} onClick$={cancelEdit}>Cancel</button>
                                                        <button class={styles.saveBtn} onClick$={() => saveEdit(actualIndex)}>Save Changes</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div class={styles.detailsGrid}>
                                                    {birdFields.map(field => (
                                                        <div key={field.key as string} class={styles.detailItem}>
                                                            <span class={styles.detailLabel}>{field.label}</span>
                                                            <span class={styles.detailValue}>{bird[field.key] || "—"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
});
