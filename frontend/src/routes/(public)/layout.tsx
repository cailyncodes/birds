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
                <button
                    class={styles.hamburger}
                    onClick$={() => isMenuOpen.value = !isMenuOpen.value}
                    aria-label="Toggle navigation"
                    aria-expanded={isMenuOpen.value}
                >
                    <span class={styles.bar}></span>
                    <span class={styles.bar}></span>
                    <span class={styles.bar}></span>
                </button>
                <nav class={isMenuOpen.value ? styles["mobile-nav-open"] : null} aria-label="Main navigation">
                    <ul>
                        <li><Link href="/" data-active={location.url.pathname == "/"}>Home</Link></li>
                        <li><Link href="/about/" data-active={location.url.pathname == "/about/"}>About</Link></li>
                        <li><Link href="/donate/" prefetch={false} data-active={location.url.pathname == "/donate/"}>Donate</Link></li>
                        {isLoggedIn.value ?
                            <li><Link href="/dashboard/" data-active={location.url.pathname == "/dashboard/"}>Dashboard</Link></li> :
                            <li><Link href="/signin/" data-active={location.url.pathname == "/signin/"}>Sign In</Link></li>
                        }
                    </ul>
                </nav>
            </header>
            <main class={styles["content-main"]} onClick$={() => isMenuOpen.value = false}>
                <Slot />
            </main>
            <footer class={styles.footer}>
                <div class={styles["footer-content"]}>
                    <p class={styles["footer-copy"]}>Made with love for birders everywhere.</p>
                </div>
            </footer>
        </div>
    );
});