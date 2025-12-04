import useLocalstorage from "./use-localstorage";

export default () => useLocalstorage<string>({ key: "ebird-api-token" });
