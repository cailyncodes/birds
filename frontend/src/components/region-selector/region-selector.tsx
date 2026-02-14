import { $, component$, useSignal, type Signal } from "@builder.io/qwik";

import "./region-selector.css";

interface RegionSelectorProps {
  selectedRegionCode: Signal<string>;
  required?: boolean;
}

interface Region {
  code: string;
  name: string;
}

const COUNTRIES = [
  { value: "AF", text: "Afghanistan" },
  { value: "AL", text: "Albania" },
  { value: "DZ", text: "Algeria" },
  { value: "AS", text: "American Samoa" },
  { value: "AD", text: "Andorra" },
  { value: "AO", text: "Angola" },
  { value: "AI", text: "Anguilla" },
  { value: "AG", text: "Antigua Barbuda" },
  { value: "AR", text: "Argentina" },
  { value: "AM", text: "Armenia" },
  { value: "AW", text: "Aruba" },
  { value: "AU", text: "Australia" },
  { value: "AT", text: "Austria" },
  { value: "AZ", text: "Azerbaijan" },
  { value: "BS", text: "Bahamas" },
  { value: "BH", text: "Bahrain" },
  { value: "BD", text: "Bangladesh" },
  { value: "BB", text: "Barbados" },
  { value: "BY", text: "Belarus" },
  { value: "BE", text: "Belgium" },
  { value: "BZ", text: "Belize" },
  { value: "BJ", text: "Benin" },
  { value: "BM", text: "Bermuda" },
  { value: "BT", text: "Bhutan" },
  { value: "BO", text: "Bolivia" },
  { value: "BQ", text: "Bonaire" },
  { value: "BA", text: "Bosnia Herzegovina" },
  { value: "BW", text: "Botswana" },
  { value: "BR", text: "Brazil" },
  { value: "BN", text: "Brunei" },
  { value: "BG", text: "Bulgaria" },
  { value: "BI", text: "Burundi" },
  { value: "KH", text: "Cambodia" },
  { value: "CM", text: "Cameroon" },
  { value: "CA", text: "Canada" },
  { value: "CF", text: "Central African" },
  { value: "TD", text: "Chad" },
  { value: "CL", text: "Chile" },
  { value: "CN", text: "China" },
  { value: "CO", text: "Colombia" },
  { value: "KM", text: "Comoros" },
  { value: "CG", text: "Congo" },
  { value: "HR", text: "Croatia" },
  { value: "CU", text: "Cuba" },
  { value: "CW", text: "Curacao" },
  { value: "CY", text: "Cyprus" },
  { value: "CZ", text: "Czech" },
  { value: "DK", text: "Denmark" },
  { value: "DJ", text: "Djibouti" },
  { value: "DM", text: "Dominica" },
  { value: "TL", text: "East Timor" },
  { value: "EC", text: "Ecuador" },
  { value: "EG", text: "Egypt" },
  { value: "ER", text: "Eritrea" },
  { value: "EE", text: "Estonia" },
  { value: "ET", text: "Ethiopia" },
  { value: "FI", text: "Finland" },
  { value: "FR", text: "France" },
  { value: "GA", text: "Gabon" },
  { value: "GM", text: "Gambia" },
  { value: "GE", text: "Georgia" },
  { value: "DE", text: "Germany" },
  { value: "GH", text: "Ghana" },
  { value: "GI", text: "Gibraltar" },
  { value: "GR", text: "Greece" },
  { value: "GL", text: "Greenland" },
  { value: "GD", text: "Grenada" },
  { value: "GP", text: "Guadeloupe" },
  { value: "GU", text: "Guam" },
  { value: "GT", text: "Guatemala" },
  { value: "GN", text: "Guinea" },
  { value: "GY", text: "Guyana" },
  { value: "HT", text: "Haiti" },
  { value: "HN", text: "Honduras" },
  { value: "HK", text: "Hongkong" },
  { value: "HU", text: "Hungary" },
  { value: "IS", text: "Iceland" },
  { value: "ID", text: "Indonesia" },
  { value: "IN", text: "India" },
  { value: "IR", text: "Iran" },
  { value: "IQ", text: "Iraq" },
  { value: "IE", text: "Ireland" },
  { value: "IL", text: "Israel" },
  { value: "IT", text: "Italy" },
  { value: "JM", text: "Jamaica" },
  { value: "JP", text: "Japan" },
  { value: "JO", text: "Jordan" },
  { value: "KZ", text: "Kazakhstan" },
  { value: "KE", text: "Kenya" },
  { value: "KI", text: "Kiribati" },
  { value: "KP", text: "Korea North" },
  { value: "KR", text: "Korea South" },
  { value: "KW", text: "Kuwait" },
  { value: "KG", text: "Kyrgyzstan" },
  { value: "LA", text: "Laos" },
  { value: "LV", text: "Latvia" },
  { value: "LB", text: "Lebanon" },
  { value: "LS", text: "Lesotho" },
  { value: "LR", text: "Liberia" },
  { value: "LY", text: "Libya" },
  { value: "LI", text: "Liechtenstein" },
  { value: "LT", text: "Lithuania" },
  { value: "LU", text: "Luxembourg" },
  { value: "MO", text: "Macau" },
  { value: "MK", text: "Macedonia" },
  { value: "MG", text: "Madagascar" },
  { value: "MY", text: "Malaysia" },
  { value: "MW", text: "Malawi" },
  { value: "MV", text: "Maldives" },
  { value: "ML", text: "Mali" },
  { value: "MT", text: "Malta" },
  { value: "MQ", text: "Martinique" },
  { value: "MR", text: "Mauritania" },
  { value: "MU", text: "Mauritius" },
  { value: "YT", text: "Mayotte" },
  { value: "MX", text: "Mexico" },
  { value: "MD", text: "Moldova" },
  { value: "MC", text: "Monaco" },
  { value: "MN", text: "Mongolia" },
  { value: "MS", text: "Montserrat" },
  { value: "MA", text: "Morocco" },
  { value: "MZ", text: "Mozambique" },
  { value: "MM", text: "Myanmar" },
  { value: "NA", text: "Namibia" },
  { value: "NR", text: "Nauru" },
  { value: "NP", text: "Nepal" },
  { value: "NL", text: "Netherlands" },
  { value: "KN", text: "Nevis" },
  { value: "NC", text: "New Caledonia" },
  { value: "NZ", text: "New Zealand" },
  { value: "NI", text: "Nicaragua" },
  { value: "NE", text: "Niger" },
  { value: "NG", text: "Nigeria" },
  { value: "NO", text: "Norway" },
  { value: "OM", text: "Oman" },
  { value: "PK", text: "Pakistan" },
  { value: "PS", text: "Palestine" },
  { value: "PA", text: "Panama" },
  { value: "PG", text: "Papua New Guinea" },
  { value: "PY", text: "Paraguay" },
  { value: "PE", text: "Peru" },
  { value: "PH", text: "Philippines" },
  { value: "PL", text: "Poland" },
  { value: "PT", text: "Portugal" },
  { value: "PR", text: "Puerto Rico" },
  { value: "QA", text: "Qatar" },
  { value: "ME", text: "Montenegro" },
  { value: "RS", text: "Serbia" },
  { value: "RE", text: "Reunion" },
  { value: "RO", text: "Romania" },
  { value: "RU", text: "Russia" },
  { value: "RW", text: "Rwanda" },
  { value: "MP", text: "Saipan" },
  { value: "WS", text: "Samoa" },
  { value: "SA", text: "Saudi Arabia" },
  { value: "SN", text: "Senegal" },
  { value: "SC", text: "Seychelles" },
  { value: "SL", text: "Sierra Leone" },
  { value: "SG", text: "Singapore" },
  { value: "SK", text: "Slovakia" },
  { value: "SI", text: "Slovenia" },
  { value: "SB", text: "Solomon" },
  { value: "SO", text: "Somalia" },
  { value: "ZA", text: "South Africa" },
  { value: "ES", text: "Spain" },
  { value: "LK", text: "Sri Lanka" },
  { value: "SD", text: "Sudan" },
  { value: "SR", text: "Suriname" },
  { value: "SZ", text: "Swaziland" },
  { value: "SE", text: "Sweden" },
  { value: "CH", text: "Switzerland" },
  { value: "SY", text: "Syria" },
  { value: "PF", text: "Tahiti" },
  { value: "TW", text: "Taiwan" },
  { value: "TJ", text: "Tajikistan" },
  { value: "TZ", text: "Tanzania" },
  { value: "TH", text: "Thailand" },
  { value: "TG", text: "Togo" },
  { value: "TO", text: "Tonga" },
  { value: "TN", text: "Tunisia" },
  { value: "TR", text: "Türkiye" },
  { value: "TM", text: "Turkmenistan" },
  { value: "TV", text: "Tuvalu" },
  { value: "UG", text: "Uganda" },
  { value: "GB", text: "United Kingdom" },
  { value: "UA", text: "Ukraine" },
  { value: "AE", text: "United Arab Emirates" },
  { value: "US", text: "United States of America" },
  { value: "UY", text: "Uruguay" },
  { value: "UZ", text: "Uzbekistan" },
  { value: "VU", text: "Vanuatu" },
  { value: "VA", text: "Vatican" },
  { value: "VE", text: "Venezuela" },
  { value: "VN", text: "Vietnam" },
  { value: "YE", text: "Yemen" },
  { value: "CD", text: "Democratic Republic of the Congo" },
  { value: "ZM", text: "Zambia" },
  { value: "ZW", text: "Zimbabwe" },
];

export default component$<RegionSelectorProps>(({ selectedRegionCode, required = false }) => {
  const countryCode = useSignal<string>("");
  const countryDropdownOpen = useSignal(false);
  const countryTextFilter = useSignal("");
  const regionDropdownOpen = useSignal(false);
  const regionTextFilter = useSignal("");
  const regionsResource = useSignal<Region[]>([]);

  if (selectedRegionCode.value && !countryCode.value) {
    const parts = selectedRegionCode.value.split("-");
    if (parts.length >= 1) {
      countryCode.value = parts[0];
    }
  }

  const fetchRegions = $(async (country: string) => {
    if (!country) {
      regionsResource.value = [];
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_API_URL}/api/regions/search?country_code=${country}`
      );
      if (response.ok) {
        const data = await response.json();
        regionsResource.value = data.regions || [];
      } else {
        regionsResource.value = [];
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      regionsResource.value = [];
    }
  });

  if (countryCode.value) {
    fetchRegions(countryCode.value);
  }

  const getCountryByCode = (code?: string) => {
    if (!code) return "";
    const country = COUNTRIES.find((c) => c.value === code);
    return country?.text || "";
  };

  const getRegionByCode = (code?: string) => {
    if (!code || regionsResource.value.length === 0) return "";
    const region = regionsResource.value.find((r) => r.code === code);
    return region?.name || "";
  };

  const filteredCountries = COUNTRIES.filter((c) =>
    c.text.toLowerCase().includes(countryTextFilter.value.toLowerCase())
  );

  const filteredRegions = regionsResource.value.filter((r) =>
    r.name.toLowerCase().includes(regionTextFilter.value.toLowerCase())
  );

  return (
    <div class="region-selector">
      <div class="form-group">
        <label for="country-select">
          Country{required && <span class="required">*</span>}
        </label>
        <div class="dropdown-container">
          <div
            class={`dropdown-select ${countryDropdownOpen.value ? "open" : ""}`}
            onClick$={() => {
              countryDropdownOpen.value = !countryDropdownOpen.value;
              if (!countryDropdownOpen.value) {
                countryTextFilter.value = "";
              }
            }}
          >
            {countryCode.value ? getCountryByCode(countryCode.value) : "Select a country"}
          </div>
          {countryDropdownOpen.value && (
            <div class="dropdown-menu">
              <input
                class="dropdown-menu-search"
                placeholder="Search countries..."
                type="text"
                value={countryTextFilter.value}
                onInput$={(e) => {
                  countryTextFilter.value = (e.target as HTMLInputElement).value;
                }}
                onClick$={(e) => e.stopPropagation()}
              />
              <div class="dropdown-menu-inner">
                {filteredCountries.map((country) => (
                  <div
                    key={country.value}
                    class="dropdown-menu-item"
                    data-value={country.value}
                    onClick$={(e) => {
                      const target = e.target as HTMLDivElement;
                      const selected = target.dataset.value || "";
                      countryCode.value = selected;
                      selectedRegionCode.value = "";
                      regionTextFilter.value = "";
                      countryDropdownOpen.value = false;
                      countryTextFilter.value = "";
                      fetchRegions(selected);
                    }}
                  >
                    {country.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div class="form-group">
        <label for="region-select">
          Region{required && <span class="required">*</span>}
        </label>
        <div class="dropdown-container">
          <div
            class={`dropdown-select ${regionDropdownOpen.value ? "open" : ""} ${!countryCode.value ? "disabled" : ""}`}
            onClick$={() => {
              if (!countryCode.value) return;
              regionDropdownOpen.value = !regionDropdownOpen.value;
              if (!regionDropdownOpen.value) {
                regionTextFilter.value = "";
              }
            }}
          >
            {selectedRegionCode.value
              ? getRegionByCode(selectedRegionCode.value)
              : countryCode.value
                ? "Select a region"
                : "Select a country first"}
          </div>
          {regionDropdownOpen.value && countryCode.value && (
            <div class="dropdown-menu">
              <input
                class="dropdown-menu-search"
                placeholder="Search regions..."
                type="text"
                value={regionTextFilter.value}
                onInput$={(e) => {
                  regionTextFilter.value = (e.target as HTMLInputElement).value;
                }}
                onClick$={(e) => e.stopPropagation()}
              />
              <div class="dropdown-menu-inner">
                {filteredRegions.length > 0 ? (
                  filteredRegions.map((region) => (
                    <div
                      key={region.code}
                      class="dropdown-menu-item"
                      data-value={region.code}
                      onClick$={(e) => {
                        const target = e.target as HTMLDivElement;
                        const selected = target.dataset.value || "";
                        selectedRegionCode.value = selected;
                        regionDropdownOpen.value = false;
                        regionTextFilter.value = "";
                      }}
                    >
                      {region.name}
                    </div>
                  ))
                ) : (
                  <div class="dropdown-menu-item disabled">No regions found</div>
                )}
              </div>
            </div>
          )}
        </div>
        {selectedRegionCode.value && (
          <span class="selected-code">Code: {selectedRegionCode.value}</span>
        )}
      </div>
    </div>
  );
});
