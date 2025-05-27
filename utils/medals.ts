/**
 * Sorts items by Olympic medal ranking (gold first, then silver, then bronze)
 */
export const sortByMedals =  (items: any[]) => {
    return [...items].sort((a: any, b: any) => {
        if (a.medals.length === 0 && b.medals.length === 0) return 0;

        const gold_a = a.medals.filter((m: any) => m.type === "Gold Medal");
        const gold_b = b.medals.filter((m: any) => m.type === "Gold Medal");
        if (gold_b !== gold_a) {
            return gold_b - gold_a;
        }

        const silver_a = a.medals.filter((m: any) => m.type === "Silver Medal");
        const silver_b = b.medals.filter((m: any) => m.type === "Silver Medal");
        if (silver_b !== silver_a) {
            return silver_b - silver_a;
        }

        const bronze_a = a.medals.filter((m: any) => m.type === "Bronze Medal");
        const bronze_b = b.medals.filter((m: any) => m.type === "Bronze Medal");
        return bronze_b - bronze_a;
    });
};
