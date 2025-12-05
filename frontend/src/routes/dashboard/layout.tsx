import { component$, Slot } from '@builder.io/qwik';
import { Link, RequestHandler, routeLoader$, useLocation } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ cacheControl }) => {
    cacheControl({
        public: false, // Prevents CDN caching
        noCache: true,
        noStore: true,
        maxAge: 0,     // Ensures the browser always revalidates the data
    });
};

export const useJWT = routeLoader$(({ cookie, cacheControl }) => {
    cacheControl({
        public: false,
        noCache: true,
        noStore: true,
        maxAge: 0
    })
    return cookie.get("jwt")?.value;
});

export default component$(() => {
    const location = useLocation();
    const paths = location.url.pathname.split("/").slice(1, -1)
    const tabs = ["", "lists", "map", "trips", "alerts", "settings"]
    const activeTab = tabs.find((tab) => paths.includes(tab)) ?? "";

    const jwt = useJWT();

    if (!jwt.value) {
        return <p>Please sign in</p>
    }

    return (
        <div class="container">
            <aside>
                <ul>
                    <Link href="/dashboard"><li data-active={activeTab == ""}>Overview</li></Link>
                    <Link href="/dashboard/lists/"><li data-active={activeTab == "lists"}>Lists</li></Link>
                    <Link href="/dashboard/map/" prefetch={false}><li data-active={activeTab == "map"}>Map</li></Link>
                    <Link href="/dashboard/trips/"><li data-active={activeTab == "trips"}>Trips</li></Link>
                    {/* <span style={{height: "1px", width: "100%", backgroundColor: "black" }} /> */}
                    <Link href="/dashboard/alerts/"><li data-active={activeTab == "alerts"}>Alerts</li></Link>
                    <Link href="/dashboard/settings/"><li data-active={activeTab == "settings"}>Settings</li></Link>
                </ul>
            </aside>
            <Slot />
        </div>
    );
});
