import { globalAction$ } from "@builder.io/qwik-city";

export const useCreateAccount = globalAction$(async (data, event) => {
    const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/users`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${event.cookie.get("jwt")}` },
        method: "POST",
        body: `{"username":"${data.username}", "password": "${data.password}"}`
    });

    if (response.status !== 200) {
        return {}
    }
    const result = await response.json();
    event.cookie.set("jwt", result.jwt, { path: "/", expires: new Date(result.expiration) })
    return result.jwt;
});

export const useSignIn = globalAction$(async (data, event) => {
    const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/login`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${event.cookie.get("jwt")}` },
        method: "POST",
        body: `{"username":"${data.username}", "password": "${data.password}"}`
    });

    if (response.status !== 200) {
        return {}
    }
    const result = await response.json();
    event.cookie.set("jwt", result.jwt, { path: "/", expires: new Date(result.expiration) })
    return result.jwt;
});
