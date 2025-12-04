import { component$, QRL, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl, { GeoJSONSourceSpecification, RasterArraySourceSpecification, SourceSpecification } from 'mapbox-gl';

import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import "./map.css";

const BIRDSPOT_DEFAULT = "mapbox://styles/cailyncodes/cmig9prkg008s01qthpjt4y1g";
const BIRDSPOT_SATELLITE = "mapbox://styles/cailyncodes/cmigatj9b00mj01s4a3woat6e";

const extractRegionInfoFromSearchResult = (result: MapboxGeocoder.Result) => {
    const allContexts = [result, ...(result.context ?? [])]

    return allContexts.reduce((acc, context) => {
        const placeType = context.place_type?.[0] ?? context.id.split(".").shift()
        if (["district", "region", "country"].includes(placeType)) {
            // This is a hack, but I don't want to fix the Trie search (again)
            let locale = context["text_en-US"]
            if (locale.includes(" County")) {
                locale = locale.split(" County").filter((i: string) => i != " County").join("")
            }
            // end hack
            if (acc) {
                return `${acc}, ${locale}`;
            }
            return locale;
        }
        return acc;
    }, undefined);
}

export interface Source {
    id: string;
    specification: Modify<Exclude<SourceSpecification, RasterArraySourceSpecification>, Modify<GeoJSONSourceSpecification, { filter?: any[] }>>
}

interface MapProps {
    sources: Array<Source>;
    layers: Array<any>;
    onLocationChange$: QRL<(location?: string) => void>;
}

export default component$(({ sources, layers, onLocationChange$ }: MapProps) => {
    const mapRef = useSignal<mapboxgl.Map>();
    const mapContainerRef = useSignal<HTMLElement>();
    const mapStyle = useSignal(BIRDSPOT_DEFAULT);
    const maxboxGeocoder = useSignal<MapboxGeocoder>()
    const region = useSignal<string>();

    useVisibleTask$(({ track }) => {
        track(() => region.value);

        onLocationChange$(region.value);
    })

    useVisibleTask$(({ cleanup }) => {
        if (!mapContainerRef.value) return;

        // TODO(cailyn): Read from config
        mapboxgl.accessToken = "pk.eyJ1IjoiY2FpbHluY29kZXMiLCJhIjoiY21pZzhtcHEwMDQycjNmcHZkYjBjejhjeCJ9.Yq15jupSJy5JDiOI_9IKpg";
        mapRef.value = new mapboxgl.Map({
            container: mapContainerRef.value,
            center: [-74.0242, 40.6941],
            zoom: 10.12,
            style: mapStyle.value
        });

        maxboxGeocoder.value = new MapboxGeocoder({
            accessToken: "pk.eyJ1IjoiY2FpbHluY29kZXMiLCJhIjoiY21pZzhtcHEwMDQycjNmcHZkYjBjejhjeCJ9.Yq15jupSJy5JDiOI_9IKpg",
            useBrowserFocus: true,
            enableGeolocation: true,
            addressAccuracy: 'place',
            marker: false,
            flyTo: {
                zoom: 12
            },
            // @ts-expect-error (not sure why there is the error but seems to work just fine)
            mapboxgl: mapboxgl
        })

        mapRef.value.addControl(maxboxGeocoder.value);

        maxboxGeocoder.value.on('result', ({ result }) => {
            region.value = extractRegionInfoFromSearchResult(result);
        });

        cleanup(() => {
            mapRef.value?.remove();
        })
    })

    useVisibleTask$(({ track }) => {
        track(() => sources);
        track(() => layers);

        if (mapRef && mapRef.value) {
            if (mapRef.value.getSource('test')) {
                mapRef.value.removeSource('test')
            }
            if (mapRef.value.getLayer('test')) {
                mapRef.value.removeLayer('test')
            }
            sources.forEach(source => mapRef.value?.addSource(source.id, source.specification));
            layers.forEach(layer => mapRef.value?.addLayer(layer))
        }
    });

    useVisibleTask$(({ track }) => {
        track(() => mapStyle.value)
        mapRef.value?.setStyle(mapStyle.value);
    })

    return (
        <div class='map-wrapper'>
            <div class='map-style-controls'>
                <button onClick$={() => mapStyle.value = BIRDSPOT_DEFAULT}>Default</button>
                <button onClick$={() => mapStyle.value = BIRDSPOT_SATELLITE}>Satellite</button>
            </div>
            <div class='map-container' ref={mapContainerRef}/>
        </div>
    )
})