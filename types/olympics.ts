export interface Medals {
    gold: number;
    silver: number;
    bronze: number;
    total: number;
}

export interface Athlete {
    slug: string;
    name: string;
    country?: string;
    countryCode?: string;
    medals?: Medals;
}

export interface Country {
    slug: string;
    name: string;
    code: string;
    medals?: Medals;
}

export interface Venue {
    slug: string;
    name: string;
    description?: string;
}

export interface SportData {
    name: string;
    code?: string;
    slug: string;
    description?: string;
    events: string[];
    athletes: Athlete[];
    countries: Country[];
    venues: Venue[];
}

export interface SportsDataMap {
    [key: string]: SportData;
}
