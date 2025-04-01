export interface Medals {
    gold: number;
    silver: number;
    bronze: number;
    total: number;
}

export interface Medal {
    date: string;
    type: string;
    event: string;
    discipline: string;
}

export interface Athlete {
    slug: string;
    name: string;
    country?: string;
    countryCode?: string;
    medals?: Medals;
}

export interface AthleteData {
    name: string;
    name_short?: string;
    gender?: string;
    photoUrl?: string;
    country?: Country;
    nationality?: string;
    birth_date?: string;
    age?: number;
    birth_place?: string;
    birth_country?: string;
    height?: number;
    weight?: number;
    sports: Sport[];
    events: string[];
    bio?: string;
    nickname?: string;
    hobbies?: string;
    occupation?: string;
    education?: string;
    family?: string;
    languages?: string;
    coach?: string;
    hero?: string;
    achievements: Medal[];
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

export interface Sport {
    slug: string;
    name: string;
    description: string;
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