import { component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

import "./header.css";

export default component$(() => {
    const location = useLocation();

    return (
        <div class="header-wrapper">
            <div class="header-name">
                <img src="/logo.png" width="85" height="85" />
                <h1>BirdSpot</h1>
            </div>
            <nav class="header-nav">
                <ul style="list-style: none; display: flex; gap: 15px; padding: 0;">
                    <li><Link href="/" data-active={location.url.pathname == "/"}>Home</Link></li>
                    <li><Link href="/dashboard/" data-active={location.url.pathname.includes("/dashboard/")}>Dashboard</Link></li>
                    <li><Link href="/about/" data-active={location.url.pathname == "/about/"}>About</Link></li>
                    <li><Link href="/donate/" data-active={location.url.pathname == "/donate/"}>Donate</Link></li>
                    <li><Link href="/signin/" data-active={location.url.pathname == "/signin/"}>Sign In</Link></li>
                </ul>
            </nav>
        </div>
    )
})