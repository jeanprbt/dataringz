import type { Medals } from "~/types/olympics";

/**
 * Sorts items by Olympic medal ranking (gold first, then silver, then bronze)
 */
export const sortByMedals = <T extends { medals?: Medals }>(
    items: T[]
): T[] => {
    return [...items].sort((a, b) => {
        if (!a.medals || !b.medals) return 0;

        if (b.medals.gold !== a.medals.gold) {
            return b.medals.gold - a.medals.gold;
        }
        if (b.medals.silver !== a.medals.silver) {
            return b.medals.silver - a.medals.silver;
        }
        return b.medals.bronze - a.medals.bronze;
    });
};
