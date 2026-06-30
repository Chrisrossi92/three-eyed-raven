import type { House } from "../data/ravenTypes.js";

export function createHouseAutocompleteChoices(houses: House[], query: string): Array<{
  name: string;
  value: string;
}> {
  const normalizedQuery = normalizeHouseSearch(query);

  return houses
    .filter((house) => {
      if (!normalizedQuery) {
        return true;
      }

      return normalizeHouseSearch(house.name).includes(normalizedQuery);
    })
    .slice(0, 25)
    .map((house) => ({
      name: house.name,
      value: house.name
    }));
}

export function resolveHouseSearch(houses: House[], query: string): House | undefined {
  const normalizedQuery = normalizeHouseSearch(query);
  if (!normalizedQuery) {
    return undefined;
  }

  const exact = houses.find((house) => normalizeHouseSearch(house.name) === normalizedQuery);
  if (exact) {
    return exact;
  }

  const matches = houses.filter((house) => normalizeHouseSearch(house.name).includes(normalizedQuery));
  return matches.length === 1 ? matches[0] : undefined;
}

function normalizeHouseSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^house\s+/, "")
    .replace(/[^a-z0-9]+/g, "");
}
