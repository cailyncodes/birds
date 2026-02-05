import { $, component$, Resource, useContext, useResource$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { SettingsContext } from "~/routes/layout";
import useLocalstorage from "../../hooks/use-localstorage";

import "./default-region.css";

export default component$(() => {
    const settings = useContext(SettingsContext);
    const defaultCountry = useSignal<string>("");
    const defaultRegion = useLocalstorage<string>({ key: "birdspot.defaults.region" });
    const editRegionDisplay = useSignal<boolean>(false);
    const countryDropdownDisplay = useSignal<string>("none");
    const countryTextFilter = useSignal<string>("");
    const regionDropdownDisplay = useSignal<string>("none");
    const regionTextFilter = useSignal<string>("");

    useVisibleTask$(({ track }) => {
        track(() => defaultRegion.value)
        settings.defaults = { ...settings.defaults, region: defaultRegion.value ?? "" }
        defaultCountry.value = defaultRegion.value?.split("-")[0] ?? "";
    })

    const countries = [
        { "value": "AF", "text": "Afghanistan" },
        { "value": "AL", "text": "Albania" },
        { "value": "DZ", "text": "Algeria" },
        { "value": "AS", "text": "American Samoa" },
        { "value": "AD", "text": "Andorra" },
        { "value": "AO", "text": "Angola" },
        { "value": "AI", "text": "Anguilla" },
        { "value": "AG", "text": "Antigua Barbuda" },
        { "value": "AR", "text": "Argentina" },
        { "value": "AM", "text": "Armenia" },
        { "value": "AW", "text": "Aruba" },
        { "value": "AU", "text": "Australia" },
        { "value": "AT", "text": "Austria" },
        { "value": "AZ", "text": "Azerbaijan" },
        { "value": "BS", "text": "Bahamas" },
        { "value": "BH", "text": "Bahrain" },
        { "value": "BD", "text": "Bangladesh" },
        { "value": "BB", "text": "Barbados" },
        { "value": "BY", "text": "Belarus" },
        { "value": "BE", "text": "Belgium" },
        { "value": "BZ", "text": "Belize" },
        { "value": "BJ", "text": "Benin" },
        { "value": "BM", "text": "Bermuda" },
        { "value": "BT", "text": "Bhutan" },
        { "value": "BO", "text": "Bolivia" },
        { "value": "BQ", "text": "Bonaire" },
        { "value": "BA", "text": "Bosnia Herzegovina" },
        { "value": "BW", "text": "Botswana" },
        { "value": "BR", "text": "Brazil" },
        { "value": "BN", "text": "Brunei" },
        { "value": "BG", "text": "Bulgaria" },
        { "value": "BI", "text": "Burundi" },
        { "value": "KH", "text": "Cambodia" },
        { "value": "CM", "text": "Cameroon" },
        { "value": "CA", "text": "Canada" },
        { "value": "CF", "text": "Central African" },
        { "value": "TD", "text": "Chad" },
        { "value": "CL", "text": "Chile" },
        { "value": "CN", "text": "China" },
        { "value": "CO", "text": "Colombia" },
        { "value": "KM", "text": "Comoros" },
        { "value": "CG", "text": "Congo" },
        { "value": "HR", "text": "Croatia" },
        { "value": "CU", "text": "Cuba" },
        { "value": "CW", "text": "Curacao" },
        { "value": "CY", "text": "Cyprus" },
        { "value": "CZ", "text": "Czech" },
        { "value": "DK", "text": "Denmark" },
        { "value": "DJ", "text": "Djibouti" },
        { "value": "DM", "text": "Dominica" },
        { "value": "TL", "text": "East Timor" },
        { "value": "EC", "text": "Ecuador" },
        { "value": "EG", "text": "Egypt" },
        { "value": "ER", "text": "Eritrea" },
        { "value": "EE", "text": "Estonia" },
        { "value": "ET", "text": "Ethiopia" },
        { "value": "FI", "text": "Finland" },
        { "value": "FR", "text": "France" },
        { "value": "GA", "text": "Gabon" },
        { "value": "GM", "text": "Gambia" },
        { "value": "GE", "text": "Georgia" },
        { "value": "DE", "text": "Germany" },
        { "value": "GH", "text": "Ghana" },
        { "value": "GI", "text": "Gibraltar" },
        { "value": "GR", "text": "Greece" },
        { "value": "GL", "text": "Greenland" },
        { "value": "GD", "text": "Grenada" },
        { "value": "GP", "text": "Guadeloupe" },
        { "value": "GU", "text": "Guam" },
        { "value": "GT", "text": "Guatemala" },
        { "value": "GN", "text": "Guinea" },
        { "value": "GY", "text": "Guyana" },
        { "value": "HT", "text": "Haiti" },
        { "value": "HN", "text": "Honduras" },
        { "value": "HK", "text": "Hongkong" },
        { "value": "HU", "text": "Hungary" },
        { "value": "IS", "text": "Iceland" },
        { "value": "ID", "text": "Indonesia" },
        { "value": "IN", "text": "India" },
        { "value": "IR", "text": "Iran" },
        { "value": "IQ", "text": "Iraq" },
        { "value": "IE", "text": "Ireland" },
        { "value": "IL", "text": "Israel" },
        { "value": "IT", "text": "Italy" },
        { "value": "JM", "text": "Jamaica" },
        { "value": "JP", "text": "Japan" },
        { "value": "JO", "text": "Jordan" },
        { "value": "KZ", "text": "Kazakhstan" },
        { "value": "KE", "text": "Kenya" },
        { "value": "KI", "text": "Kiribati" },
        { "value": "KP", "text": "Korea North" },
        { "value": "KR", "text": "Korea South" },
        { "value": "KW", "text": "Kuwait" },
        { "value": "KG", "text": "Kyrgyzstan" },
        { "value": "LA", "text": "Laos" },
        { "value": "LV", "text": "Latvia" },
        { "value": "LB", "text": "Lebanon" },
        { "value": "LS", "text": "Lesotho" },
        { "value": "LR", "text": "Liberia" },
        { "value": "LY", "text": "Libya" },
        { "value": "LI", "text": "Liechtenstein" },
        { "value": "LT", "text": "Lithuania" },
        { "value": "LU", "text": "Luxembourg" },
        { "value": "MO", "text": "Macau" },
        { "value": "MK", "text": "Macedonia" },
        { "value": "MG", "text": "Madagascar" },
        { "value": "MY", "text": "Malaysia" },
        { "value": "MW", "text": "Malawi" },
        { "value": "MV", "text": "Maldives" },
        { "value": "ML", "text": "Mali" },
        { "value": "MT", "text": "Malta" },
        { "value": "MQ", "text": "Martinique" },
        { "value": "MR", "text": "Mauritania" },
        { "value": "MU", "text": "Mauritius" },
        { "value": "YT", "text": "Mayotte" },
        { "value": "MX", "text": "Mexico" },
        { "value": "MD", "text": "Moldova" },
        { "value": "MC", "text": "Monaco" },
        { "value": "MN", "text": "Mongolia" },
        { "value": "MS", "text": "Montserrat" },
        { "value": "MA", "text": "Morocco" },
        { "value": "MZ", "text": "Mozambique" },
        { "value": "MM", "text": "Myanmar" },
        { "value": "NA", "text": "Namibia" },
        { "value": "NR", "text": "Nauru" },
        { "value": "NP", "text": "Nepal" },
        { "value": "NL", "text": "Netherlands" },
        { "value": "KN", "text": "Nevis" },
        { "value": "NC", "text": "New Caledonia" },
        { "value": "NZ", "text": "New Zealand" },
        { "value": "NI", "text": "Nicaragua" },
        { "value": "NE", "text": "Niger" },
        { "value": "NG", "text": "Nigeria" },
        { "value": "NO", "text": "Norway" },
        { "value": "OM", "text": "Oman" },
        { "value": "PK", "text": "Pakistan" },
        { "value": "PS", "text": "Palestine" },
        { "value": "PA", "text": "Panama" },
        { "value": "PG", "text": "Papua New Guinea" },
        { "value": "PY", "text": "Paraguay" },
        { "value": "PE", "text": "Peru" },
        { "value": "PH", "text": "Philippines" },
        { "value": "PL", "text": "Poland" },
        { "value": "PT", "text": "Portugal" },
        { "value": "PR", "text": "Puerto Rico" },
        { "value": "QA", "text": "Qatar" },
        { "value": "ME", "text": "Montenegro" },
        { "value": "RS", "text": "Serbia" },
        { "value": "RE", "text": "Reunion" },
        { "value": "RO", "text": "Romania" },
        { "value": "RU", "text": "Russia" },
        { "value": "RW", "text": "Rwanda" },
        { "value": "MP", "text": "Saipan" },
        { "value": "WS", "text": "Samoa" },
        { "value": "SA", "text": "Saudi Arabia" },
        { "value": "SN", "text": "Senegal" },
        { "value": "SC", "text": "Seychelles" },
        { "value": "SL", "text": "Sierra Leone" },
        { "value": "SG", "text": "Singapore" },
        { "value": "SK", "text": "Slovakia" },
        { "value": "SI", "text": "Slovenia" },
        { "value": "SB", "text": "Solomon" },
        { "value": "SO", "text": "Somalia" },
        { "value": "ZA", "text": "South Africa" },
        { "value": "ES", "text": "Spain" },
        { "value": "LK", "text": "Sri Lanka" },
        { "value": "SD", "text": "Sudan" },
        { "value": "SR", "text": "Suriname" },
        { "value": "SZ", "text": "Swaziland" },
        { "value": "SE", "text": "Sweden" },
        { "value": "CH", "text": "Switzerland" },
        { "value": "SY", "text": "Syria" },
        { "value": "PF", "text": "Tahiti" },
        { "value": "TW", "text": "Taiwan" },
        { "value": "TJ", "text": "Tajikistan" },
        { "value": "TZ", "text": "Tanzania" },
        { "value": "TH", "text": "Thailand" },
        { "value": "TG", "text": "Togo" },
        { "value": "TO", "text": "Tonga" },
        { "value": "TN", "text": "Tunisia" },
        { "value": "TR", "text": "Türkiye" },
        { "value": "TM", "text": "Turkmenistan" },
        { "value": "TV", "text": "Tuvalu" },
        { "value": "UG", "text": "Uganda" },
        { "value": "GB", "text": "United Kingdom" },
        { "value": "UA", "text": "Ukraine" },
        { "value": "AE", "text": "United Arab Emirates" },
        { "value": "US", "text": "United States of America" },
        { "value": "UY", "text": "Uruguay" },
        { "value": "UZ", "text": "Uzbekistan" },
        { "value": "VU", "text": "Vanuatu" },
        { "value": "VA", "text": "Vatican" },
        { "value": "VE", "text": "Venezuela" },
        { "value": "VN", "text": "Vietnam" },
        { "value": "YE", "text": "Yemen" },
        { "value": "CD", "text": "Democratic Republic of the Congo" },
        { "value": "ZM", "text": "Zambia" },
        { "value": "ZW", "text": "Zimbabwe" }
    ];

    const regions = useResource$<Record<string, string>[]>(async ({ track }) => {
        track(() => defaultCountry.value);
        if ((defaultCountry.value?.length ?? 0) === 0) return [];
        return await fetch(`${import.meta.env.PUBLIC_API_URL}/api/regions/search?country_code=${defaultCountry.value}`).then(res => res.json()).then(data => data.regions);
    });

    function getCountryByCode(code?: string) {
        if (!code) return undefined;
        const country = countries.find(c => c.value === code);
        return country?.text;
    }

    function getRegionByCode(regions: Record<string, string>[], code?: string) {
        if (!code) return undefined;
        const region = regions.find(r => r.code === code);
        return region?.name;
    }

    useTask$(({ track }) => {
        track(() => defaultRegion.value);
        if (!defaultRegion.value) return;
        window.localStorage.setItem("birdspot.defaults.region", defaultRegion.value);
        window.dispatchEvent(new CustomEvent("localstorageupdate", { detail: { key: "birdspot.defaults.region" } }))
    });

    return (
        <>
            <p>Choose a default region for your daily report. This should be the location you're most likely to bird in on a daily basis.</p>
            <Resource value={regions}
                onResolved={(regions) => (
                    <p>Default region: {getRegionByCode(regions, defaultRegion.value)}</p>
                )}
            />
            <button style={{display: editRegionDisplay.value ? "none" : "block"}} onClick$={() => editRegionDisplay.value = true}>Edit</button>
            <div style={{display: editRegionDisplay.value ? "block" : "none"}} class="default-region-edit">
                <form name="countries" class="form" id="country-form">
                    <p>Select the country of your default region</p>
                    <div class="form-group">
                        <span class="form-arrow"><i class="bx bx-chevron-down"></i></span>
                        <div class="dropdown" onMouseLeave$={$(() => {
                            if (countryTextFilter.value.length > 0) return;
                            countryDropdownDisplay.value = "none";
                            countryTextFilter.value = "";
                        })}>
                            <div class="dropdown-select" onClick$={$(() => countryDropdownDisplay.value = "block")}>{getCountryByCode(defaultCountry.value) || "Select your country"}</div>
                            <div class="dropdown-menu" style={{ display: countryDropdownDisplay.value }}>
                                <input class="dropdown-menu-search" placeholder="Search..." type="text" value={countryTextFilter.value} onInput$={$((e) => {
                                    countryTextFilter.value = (e.target as HTMLInputElement).value
                                })} />
                                <div class="dropdown-menu-inner">
                                    {countries.filter(c => c.text.toLowerCase().startsWith(countryTextFilter.value.toLowerCase())).map((country) => (
                                        <div class="dropdown-menu-item" data-value={country.value} onClick$={$((event) => {
                                            const selected = event.target as HTMLDivElement;
                                            defaultCountry.value = selected.dataset.value || "";
                                            countryDropdownDisplay.value = "none";
                                        })}>{country.text}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <form name="countries" class="form" id="region-form">
                    <p>Select your default region:</p>
                    <div class="form-group">
                        <span class="form-arrow"><i class="bx bx-chevron-down"></i></span>
                        <div class="dropdown" onMouseLeave$={$(() => {
                            if (regionTextFilter.value.length > 0) return;
                            regionDropdownDisplay.value = "none";
                            regionTextFilter.value = "";
                        })}>
                            <Resource value={regions}
                                onResolved={(regions) => <div class="dropdown-select" onClick$={$(() => regionDropdownDisplay.value = "block")}>{getRegionByCode(regions, defaultRegion.value) || "Select your region"}</div>}
                            />
                            <div class="dropdown-menu" style={{ display: regionDropdownDisplay.value }}>
                                <input class="dropdown-menu-search" placeholder="Search..." type="text" value={regionTextFilter.value} onInput$={$((e) => {
                                    regionTextFilter.value = (e.target as HTMLInputElement).value
                                })} />
                                <Resource value={regions}
                                    onResolved={(regions) => (
                                        <>{console.log(regions)}
                                            <div class="dropdown-menu-inner">
                                                {regions.filter(r => r.name.toLowerCase().startsWith(regionTextFilter.value.toLowerCase())).map((region) => (
                                                    <div class="dropdown-menu-item" data-value={region.code} onClick$={$((event) => {
                                                        const selected = event.target as HTMLDivElement;
                                                        defaultRegion.value = selected.dataset.value || "";
                                                        regionDropdownDisplay.value = "none";
                                                    })}>{region.name}</div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
});