export const postcodeCoordinates: Record<string, { lat: number; lon: number }> = {
    'EH1': { lat: 55.9533, lon: -3.1883 },
    'EH2': { lat: 55.9524, lon: -3.2000 },
    'EH3': { lat: 55.9495, lon: -3.2100 },
    'EH6': { lat: 55.9740, lon: -3.1720 },
    'EH11': { lat: 55.9300, lon: -3.2400 },
    'G1': { lat: 55.8642, lon: -4.2518 },
    'G2': { lat: 55.8617, lon: -4.2583 },
    'G3': { lat: 55.8650, lon: -4.2800 },
    'G11': { lat: 55.8700, lon: -4.3000 },
    'G40': { lat: 55.8500, lon: -4.2200 },
    'DEFAULT': { lat: 55.9000, lon: -3.7000 }
};

export const venueLocations: Record<string, { lat: number; lon: number; postcode: string; capacity: number }> = {
    'Sneaky Pete\'s': { lat: 55.9490, lon: -3.1890, postcode: 'EH1', capacity: 100 },
    'The Hug and Pint': { lat: 55.8700, lon: -4.2700, postcode: 'G3', capacity: 120 },
    'King Tut\'s': { lat: 55.8627, lon: -4.2667, postcode: 'G2', capacity: 300 },
    'The Caves': { lat: 55.9486, lon: -3.1875, postcode: 'EH1', capacity: 450 },
    'The Liquid Room': { lat: 55.9472, lon: -3.1914, postcode: 'EH1', capacity: 800 },
    'Barrowland': { lat: 55.8544, lon: -4.2386, postcode: 'G40', capacity: 1900 },
    'O2 Academy': { lat: 55.9350, lon: -3.2300, postcode: 'EH11', capacity: 3000 },
    'OVO Hydro': { lat: 55.8600, lon: -4.2850, postcode: 'G3', capacity: 14000 },
    'Murrayfield Stadium': { lat: 55.9422, lon: -3.2408, postcode: 'EH12', capacity: 67000 }
};
