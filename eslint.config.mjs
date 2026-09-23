// eslint-config-next 16 už exportuje rovnou flat config, obal FlatCompat
// není potřeba (a rozbíjel se na cyklické struktuře v pravidlech reactu).
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { ignores: [".next/**", "node_modules/**", "out/**"] },
];

export default config;
