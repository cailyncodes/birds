import { component$, Slot } from '@builder.io/qwik';
import { Link, RequestHandler, routeLoader$, useLocation } from '@builder.io/qwik-city';

export const onRequest: RequestHandler = async ({
    sharedMap,
    cookie,
}) => {
    const jwt = cookie.get("jwt")?.value
    if (jwt) {
        sharedMap.set('jwt', jwt);
    }
};

export const useJWT = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('jwt');
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
                    <Link href="/dashboard/trips/" prefetch={false}><li data-active={activeTab == "trips"}>Trips</li></Link>
                    {/* <span style={{height: "1px", width: "100%", backgroundColor: "black" }} /> */}
                    <Link href="/dashboard/alerts/"><li data-active={activeTab == "alerts"}>Alerts</li></Link>
                    <Link href="/dashboard/settings/"><li data-active={activeTab == "settings"}>Settings</li></Link>
                </ul>
            </aside>
            <Slot />
        </div>
    );
});
