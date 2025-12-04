import useLocalstorage from "./use-localstorage";

export default function useAuth() { return  useLocalstorage<string>({ key: "ebird-api-token" }) }
