import { component$, Slot } from '@builder.io/qwik';
import { RequestHandler } from '@builder.io/qwik-city';
import NavLink from '~/components/nav-link/nav-link';

export const onGet: RequestHandler = async ({ cacheControl, cookie, redirect }) => {
    cacheControl({
        public: false,
        noCache: true,
        noStore: true,
        maxAge: 0,
    });

    if (!cookie.get("jwt")?.value) {
        throw redirect(307, "/signin/");
    }
};

export default component$(() => {
    return (
        <div class="container">
            <aside>
                <ul>
                    <NavLink href="/dashboard" activeClass="active"><li>Overview</li></NavLink>
                    <NavLink href="/dashboard/lists" activeClass="active"><li>Lists</li></NavLink>
                    <NavLink href="/dashboard/map" prefetch={false} activeClass="active"><li>Map</li></NavLink>
                    <NavLink href="/dashboard/trips" activeClass="active"><li>Trips</li></NavLink>
                    <NavLink href="/dashboard/alerts" activeClass="active"><li>Alerts</li></NavLink>
                    <NavLink href="/dashboard/settings" activeClass="active"><li>Settings</li></NavLink>
                </ul>
            </aside>
            <Slot />
        </div>
    );
});
