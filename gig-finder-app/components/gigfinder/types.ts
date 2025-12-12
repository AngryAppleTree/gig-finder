export interface Gig {
    id: string | number;
    name: string;
    venue: string;
    date: string;       // ISO String
    description?: string;
    image?: string;
    ticketUrl?: string | null;
    isInternalTicketing?: boolean;
    town?: string;
    postcode?: string;
    genre?: string;
    price?: string;
}
