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
