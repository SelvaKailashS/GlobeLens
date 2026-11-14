import { GeographicRegion } from "@/types/terratrend";

export const GEOGRAPHIC_REGIONS: GeographicRegion[] = [
  {
    id: "amazon-basin",
    name: "Amazon Rainforest Basin",
    category: "Tropical",
    location: "South America (Brazil, Peru, Colombia)",
    coordinates: { lat: -3.4653, lng: -62.2159 },
    defaultZoom: 4.8,
    areaKm2: 6700000,
    description: "The world's largest tropical rainforest and terrestrial carbon sink, undergoing severe drought recurrence and fragmentation.",
    climateContext: "Tropical humid climate with distinct rainy/dry seasons, experiencing amplified vapor pressure deficits.",
    targetPhenomena: "Vapor pressure deficit spikes, forest canopy dielectric stress, and rainfall deficit clusters.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "amazon-basin",
            name: "Amazon Rainforest Basin",
            biome: "Tropical Evergreen Moist Broadleaf Forest",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-74.5, 3.2],
                [-68.0, 4.5],
                [-59.0, 3.0],
                [-51.0, 0.5],
                [-48.5, -3.0],
                [-52.0, -11.5],
                [-58.5, -14.2],
                [-67.5, -12.5],
                [-73.8, -8.0],
                [-77.5, -3.5],
                [-74.5, 3.2],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "greenland-ice",
    name: "Greenland Ice Sheet (Interior & Margin)",
    category: "Polar",
    location: "North Atlantic / Arctic",
    coordinates: { lat: 72.0, lng: -40.0 },
    defaultZoom: 3.8,
    areaKm2: 1710000,
    description: "Continental ice sheet containing ~2.85 million km³ of freshwater ice, experiencing surface mass balance decline and melt ponds.",
    climateContext: "Polar ice cap climate with negative year-round temperatures, with recent summer ablation zone expansions.",
    targetPhenomena: "Albedo decay from wet snow and cryoconite deposition; seasonal melt duration anomalies.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "greenland-ice",
            name: "Greenland Ice Sheet",
            biome: "Polar Ice Cap",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-50.0, 60.5],
                [-43.0, 60.0],
                [-36.0, 64.5],
                [-22.0, 71.0],
                [-18.0, 78.5],
                [-30.0, 83.2],
                [-48.0, 82.5],
                [-56.0, 78.0],
                [-54.0, 71.0],
                [-51.0, 65.0],
                [-50.0, 60.5],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "sahel-belt",
    name: "Sahel Transition Belt",
    category: "Arid",
    location: "North-Central Africa (Senegal to Sudan)",
    coordinates: { lat: 14.8, lng: 16.0 },
    defaultZoom: 4.2,
    areaKm2: 3050000,
    description: "Semi-arid transition zone between the Sahara desert and Sudanian savanna, prone to prolonged decadal droughts and episodic greening.",
    climateContext: "Semi-arid tropical climate regulated by the West African Monsoon (WAM) and Intertropical Convergence Zone.",
    targetPhenomena: "Monsoonal rainfall variability, dryland vegetation dynamics, and dust aerosol optical depth.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "sahel-belt",
            name: "Sahel Belt",
            biome: "Semi-Arid Steppe / Acacia Savanna",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-16.5, 14.0],
                [-8.0, 16.2],
                [5.0, 16.8],
                [18.0, 16.0],
                [32.0, 15.5],
                [38.0, 14.0],
                [35.0, 11.5],
                [20.0, 12.0],
                [5.0, 12.5],
                [-6.0, 12.0],
                [-15.0, 11.5],
                [-16.5, 14.0],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "arctic-archipelago",
    name: "Arctic Svalbard & Barents Shelf",
    category: "Polar",
    location: "High Arctic (78°N, 16°E)",
    coordinates: { lat: 78.2, lng: 18.0 },
    defaultZoom: 4.5,
    areaKm2: 1200000,
    description: "Fastest-warming marine-cryospheric region on Earth due to Arctic amplification and sea ice retreat.",
    climateContext: "Marine High-Arctic climate heavily influenced by the North Atlantic Current warming.",
    targetPhenomena: "Winter warm spells, sea-ice loss feedbacks, and rapid tundra greening.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "arctic-archipelago",
            name: "Arctic Svalbard & Barents Shelf",
            biome: "High Arctic Tundra & Sea Ice",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [10.0, 75.0],
                [28.0, 75.0],
                [35.0, 79.5],
                [25.0, 81.5],
                [12.0, 81.0],
                [8.0, 78.0],
                [10.0, 75.0],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "western-us-basin",
    name: "Western US Colorado Basin",
    category: "Continental",
    location: "North America (SW United States)",
    coordinates: { lat: 37.0, lng: -111.0 },
    defaultZoom: 5.2,
    areaKm2: 640000,
    description: "Crucial watershed supporting 40+ million people, subjected to a 22-year persistent megadrought and declining mountain snowpack.",
    climateContext: "Semi-arid to alpine watershed driven by winter snow water equivalent and summer monsoon.",
    targetPhenomena: "Snowpack runoff reduction, reservoir depletion, and vapor pressure deficit driven wildfires.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "western-us-basin",
            name: "Western US Colorado Basin",
            biome: "Temperate Steppe & Montane Shrub",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-114.5, 43.5],
                [-109.0, 43.2],
                [-106.0, 39.5],
                [-107.5, 34.5],
                [-112.5, 31.5],
                [-115.5, 32.5],
                [-116.2, 36.5],
                [-114.5, 43.5],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "tibetan-plateau",
    name: "Tibetan Plateau ('The Third Pole')",
    category: "Highland",
    location: "Central Asia (Qinghai-Tibet, China)",
    coordinates: { lat: 32.5, lng: 88.0 },
    defaultZoom: 4.8,
    areaKm2: 2500000,
    description: "Highest plateau on Earth, acting as an atmospheric heat pump for Asian monsoons and origin of Asia's major rivers.",
    climateContext: "High-altitude alpine tundra and arid highland; sensitive to black carbon deposition.",
    targetPhenomena: "Glacial lake outburst hazards, permafrost active layer deepening, and alpine grassland phenology shift.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "tibetan-plateau",
            name: "Tibetan Plateau",
            biome: "Alpine Tundra & High Steppe",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.0, 35.5],
                [85.0, 38.0],
                [96.0, 38.5],
                [103.0, 34.0],
                [100.5, 29.0],
                [92.0, 28.0],
                [82.0, 30.5],
                [77.0, 35.5],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "great-barrier-reef",
    name: "Great Barrier Reef Lagoon",
    category: "Marine",
    location: "Coral Sea, Queensland (Australia)",
    coordinates: { lat: -18.2, lng: 147.7 },
    defaultZoom: 5.5,
    areaKm2: 348000,
    description: "The world's most extensive coral reef ecosystem, experiencing recurring mass bleaching events from marine heatwaves.",
    climateContext: "Tropical marine environment governed by maritime trade winds and El Niño-Southern Oscillation (ENSO).",
    targetPhenomena: "Degree Heating Weeks (DHW) anomalies, turbidity runoff plumes, and thermal stratification.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "great-barrier-reef",
            name: "Great Barrier Reef Lagoon",
            biome: "Tropical Coral Reef Ecosystem",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [143.5, -10.5],
                [146.5, -13.0],
                [151.0, -20.5],
                [153.2, -24.5],
                [151.5, -25.2],
                [149.0, -21.5],
                [145.0, -15.5],
                [143.0, -11.5],
                [143.5, -10.5],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "lake-chad",
    name: "Lake Chad Sahelian Oasis Basin",
    category: "Arid",
    location: "Central Africa (Chad, Niger, Nigeria, Cameroon)",
    coordinates: { lat: 13.0, lng: 14.5 },
    defaultZoom: 6.2,
    areaKm2: 25000,
    description: "Shallow endorheic lake in the Sahelian zone that contracted by 90% in the late 20th century, displaying extreme hydrologic volatility.",
    climateContext: "Hyper-evaporative arid climate with high sensitivity to monsoonal Chari-Logone river discharge.",
    targetPhenomena: "Wetland surface inundation, phreatic vegetation greening, and inter-annual shoreline displacement.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "lake-chad",
            name: "Lake Chad Basin",
            biome: "Inland Freshwater Marsh & Arid Steppe",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [13.5, 14.2],
                [15.2, 14.1],
                [15.5, 13.0],
                [14.8, 12.3],
                [13.6, 12.5],
                [13.2, 13.4],
                [13.5, 14.2],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "coimbatore",
    name: "Coimbatore & Western Ghats Foothills",
    category: "Tropical",
    location: "Tamil Nadu, India (Rain-shadow of Palakkad Gap)",
    coordinates: { lat: 11.0168, lng: 76.9558 },
    defaultZoom: 9.5,
    areaKm2: 7469,
    description: "Major industrial and agricultural hub in the rain shadow of the Palakkad Gap in the Western Ghats, experiencing urban heat island and monsoon variations.",
    climateContext: "Semi-arid tropical wet and dry climate with moderated temperatures due to proximity to the Western Ghats.",
    targetPhenomena: "Western Ghats orographic precipitation gradients, urban thermal signatures, and agricultural greenness.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "coimbatore",
            name: "Coimbatore Region",
            biome: "Tropical Dry Deciduous & Semi-Arid Agricultural Plains",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [76.75, 11.20],
                [77.20, 11.20],
                [77.20, 10.85],
                [76.75, 10.85],
                [76.75, 11.20],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "chennai",
    name: "Chennai Coastal Urban Metropolis",
    category: "Tropical",
    location: "Coromandel Coast, Tamil Nadu, India",
    coordinates: { lat: 13.0827, lng: 80.2707 },
    defaultZoom: 9.8,
    areaKm2: 1189,
    description: "Coastal metropolitan region on the Coromandel Coast of the Bay of Bengal, highly vulnerable to Northeast Monsoon cyclones, urban flooding, and sea surface temperature anomalies.",
    climateContext: "Tropical wet and dry climate dominated by Northeast Monsoon (October-December) rainfall and intense coastal humidity.",
    targetPhenomena: "Northeast monsoon precipitation extremes, urban heat island intensity, and coastal tropospheric nitrogen dioxide plumes.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "chennai",
            name: "Chennai Metropolitan Region",
            biome: "Coastal Plain & Urban Wetland Complex",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [79.95, 13.30],
                [80.40, 13.30],
                [80.40, 12.85],
                [79.95, 12.85],
                [79.95, 13.30],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: "madurai",
    name: "Madurai Vaigai River Basin",
    category: "Arid",
    location: "Southern Tamil Nadu, India (Vaigai Basin)",
    coordinates: { lat: 9.9252, lng: 78.1198 },
    defaultZoom: 9.5,
    areaKm2: 3741,
    description: "Historical cultural and agricultural center in southern Tamil Nadu located in the Vaigai river basin, prone to heat stress and seasonal water scarcity.",
    climateContext: "Hot semi-arid climate with high summer temperatures exceeding 40°C and erratic post-monsoon showers.",
    targetPhenomena: "Surface temperature extremes, drought-induced vegetation browning, and soil moisture drawdown.",
    boundaryGeoJson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: "madurai",
            name: "Madurai Vaigai Region",
            biome: "Southern Deccan Plateau Semi-Arid Scrub & River Basin",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [77.90, 10.15],
                [78.35, 10.15],
                [78.35, 9.75],
                [77.90, 9.75],
                [77.90, 10.15],
              ],
            ],
          },
        },
      ],
    },
  },
];

export const REGIONS_MAP: Record<string, GeographicRegion> = GEOGRAPHIC_REGIONS.reduce((acc, region) => {
  acc[region.id] = region;
  return acc;
}, {} as Record<string, GeographicRegion>);
