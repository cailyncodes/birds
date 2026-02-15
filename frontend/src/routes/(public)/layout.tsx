import { component$, Slot, useSignal } from '@builder.io/qwik';

import { Link, routeLoader$, useLocation } from '@builder.io/qwik-city';
import styles from "./index.module.scss";

export const useIsLoggedIn = routeLoader$(async ({ cookie }) => {
    return !!cookie.get("jwt");
})

export default component$(() => {
    const isLoggedIn = useIsLoggedIn();
    const location = useLocation();

    const isMenuOpen = useSignal(false);

    return (
        <div class={styles["page-wrapper"]}>
            <header class={styles.header}>
                <div class={styles["header-name"]} onClick$={() => isMenuOpen.value = false}>
                    <img src="/logo.png" width="85" height="85" alt="BirdSpot logo" />
                    <h1><Link href="/">BirdSpot</Link></h1>
                </div>
                <div
                    class={styles.hamburger}
                    onClick$={() => isMenuOpen.value = !isMenuOpen.value}
                    aria-label="Toggle navigation"
                    aria-expanded={isMenuOpen.value}
                >
                    <span class={styles.bar}></span>
                    <span class={styles.bar}></span>
                    <span class={styles.bar}></span>
                </div>
                <nav class={isMenuOpen.value ? styles["mobile-nav-open"] : null} aria-label="Main navigation">
                    <ul>
                        <li><Link href="/" data-active={location.url.pathname == "/"} onClick$={() => isMenuOpen.value = false}>Home</Link></li>
                        <li><Link href="/about/" data-active={location.url.pathname == "/about/"} onClick$={() => isMenuOpen.value = false}>About</Link></li>
                        <li><Link href="/donate/" prefetch={false} data-active={location.url.pathname == "/donate/"} onClick$={() => isMenuOpen.value = false}>Donate</Link></li>
                        {isLoggedIn.value ?
                            <li><Link href="/dashboard/" data-active={location.url.pathname == "/dashboard/"} onClick$={() => isMenuOpen.value = false}>Dashboard</Link></li> :
                            <li><Link href="/signin/" data-active={location.url.pathname == "/signin/"} onClick$={() => isMenuOpen.value = false}>Sign In</Link></li>
                        }
                    </ul>
                </nav>
            </header>
            <main class={styles["content-main"]} onClick$={() => isMenuOpen.value = false}>
                <Slot />
            </main>
        </div>
    );
});