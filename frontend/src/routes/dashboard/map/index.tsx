import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import { type Source } from "~/components/map/map";

const convertToGeoJSON = (hotspots: Array<unknown>): { source: Source, layer: unknown } => {
    const source: Source = {
        id: 'test',
        specification: {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: hotspots.map((hotspot: any) => ({
                    type: "Feature",
                    geometry: {
                        coordinates: [hotspot.lng, hotspot.lat],
                        type: "Point"
                    },
                    properties: hotspot
                }))
            }
        }
    }

    const layer = {
        id: 'test',
        type: 'circle',
        source: 'test',
    }

    return { source, layer }
}


export default component$(() => {
    const searchText = useSignal('');
    const regions = useSignal<Array<Record<string, string>>>([]);
    const hotspots = useSignal<Array<Record<string, string>>>([]);
    const sources = useSignal<Array<Source>>([]);
    const layers = useSignal<Array<any>>([]);

    useVisibleTask$(async ({ track }) => {
        track(() => searchText.value)
        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/regions/search?q=${searchText.value}`)
        const data = await response.json()
        regions.value = data.results ?? {}
    })

    useVisibleTask$(async ({ track }) => {
        track(() => regions.value)
        if (!regions.value[0]) {
            return;
        }
        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/regions/${regions.value[0].code}/hotspots`)
        const data = await response.json()
        hotspots.value = data ?? []
    })

    useVisibleTask$(({ track }) => {
        track(() => hotspots.value)

        const geoJson = convertToGeoJSON(hotspots.value);
        sources.value = [geoJson.source]
        layers.value = [geoJson.layer]
    })

    return <div>
        <h2>Map</h2>
            <p>Coming soon - a better map for finding hotspots.</p>
        {/* <article>
            
        </article> */}
    </div>

    // return (
    //     <div style={{padding: 0}}>
    //         <Map
    //             sources={sources.value}
    //             layers={layers.value}
    //             onLocationChange$={$((location?: string) => searchText.value = location ?? '')}
    //         />
    //     </div>
    // )
});

export const head: DocumentHead = {
  title: "BirdSpot - Map",
  meta: [
    {
      name: "description",
      content: "Make finding birds easier",
    },
  ],
};
