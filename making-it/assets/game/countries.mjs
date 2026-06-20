// Where your listeners are. `weight` is the baseline share used to distribute
// new listeners (UK dominant, so your first fans are local and the breakdown
// reads true at small numbers). The actual displayed split is a real integer
// distribution maintained in state (`fansByCountry`) — these are just the odds
// that each new listener lands in a given country.
export const COUNTRIES = [
    { name: 'United Kingdom', dot: '#1ed760', weight: 0.41 },
    { name: 'Ireland', dot: '#5b8cff', weight: 0.18 },
    { name: 'United States', dot: '#ff9d3d', weight: 0.14 },
    { name: 'Germany', dot: '#c264ff', weight: 0.11 },
    { name: 'Netherlands', dot: '#ff5c8a', weight: 0.09 },
    { name: 'Australia', dot: '#36d6c3', weight: 0.07 },
];

// The home market — first listener and rounding remainders land here.
export const HOME_COUNTRY = 'United Kingdom';

export const countryByName = Object.fromEntries(COUNTRIES.map((c) => [c.name, c]));
