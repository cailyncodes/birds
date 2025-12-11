import { globalAction$ } from "@builder.io/qwik-city";

interface JwtSignIn {
    jwt: string;
}

interface PasswordSignIn {
    username: string;
    password: string;
}

type SignIn = AllOrNone<JwtSignIn> & AllOrNone<PasswordSignIn>;

export const doSignIn = async ({ jwt, username, password }: SignIn) => {
    const authorizationHeader = jwt ? { Authorization: `Bearer ${jwt}` } : {} as {};
    const body = (username && password) ? `{"username":"${username}", "password": "${password}"}` : null

    return await fetch(`${import.meta.env.PUBLIC_API_URL}/api/login`, {
        headers: { Accept: 'application/json', ...authorizationHeader },
        method: "POST",
        body,
    });
}

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

export const useSignIn = globalAction$(async (data, { cookie }) => {
    const response = await doSignIn({ jwt: cookie.get("jwt")?.value, username: data.username.toString(), password: data.password.toString()});
    if (response.status !== 200) {
        return {}
    }
    const result = await response.json();
    cookie.set("jwt", result.jwt, { path: "/", expires: new Date(result.expiration), secure: true, sameSite: true })
    return result.jwt;
});
