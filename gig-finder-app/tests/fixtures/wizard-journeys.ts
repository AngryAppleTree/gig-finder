export interface WizardJourney {
    name: string;
    when: 'Tonight' | 'This Weekend' | 'This Week' | 'I Don\'t Know' | 'Pick a Date';
    customDate?: string;

    where: 'Locally' | 'Within 100 Miles' | 'Anywhere in Scotland';
    postcode?: string;

    size: 'Small & Cosy' | 'Quite Big' | 'Proper Huge' | 'Any Size';

    budget?: 'Free - £10' | '£10 - £20' | '£20 - £50' | '£50+' | 'Any Price';

    expectRejection?: boolean;

    // What URL params do we expect?
    expectedParams?: Record<string, string>;
}

export const WIZARD_JOURNEYS: WizardJourney[] = [
    {
        name: 'Spontaneous Cheap Night',
        when: 'Tonight',
        where: 'Anywhere in Scotland',
        size: 'Small & Cosy',
        budget: 'Free - £10',
        expectedParams: {
            when: 'tonight',
            distance: 'scotland', // Wizard.tsx mapping
            venueSize: 'small',
            budget: 'free'
        }
    },
    {
        name: 'Local Weekend Plan',
        when: 'This Weekend',
        where: 'Locally',
        postcode: 'EH1',
        size: 'Any Size',
        budget: 'Any Price',
        expectedParams: {
            when: 'weekend',
            distance: 'local',
            postcode: 'EH1',
            venueSize: 'any',
            budget: 'any'
        }
    },
    {
        name: 'Specific Date Travel (100 Miles)',
        when: 'Pick a Date',
        customDate: '2025-12-31',
        where: 'Within 100 Miles',
        postcode: 'G1',
        size: 'Quite Big',
        budget: '£10 - £20',
        expectedParams: {
            minDate: '2025-12-31',
            distance: '100miles',
            postcode: 'G1',
            venueSize: 'medium',
            budget: 'low'
        }
    },
    {
        name: 'Rejection: Proper Huge Venue',
        when: 'I Don\'t Know',
        where: 'Anywhere in Scotland',
        size: 'Proper Huge',
        expectRejection: true
    },
    {
        name: 'Mid-Week Glasgow Gig',
        when: 'This Week',
        where: 'Within 100 Miles',
        postcode: 'G2',
        size: 'Small & Cosy',
        budget: '£20 - £50',
        expectedParams: {
            when: 'week', // Mapping check
            distance: '100miles',
            postcode: 'G2',
            venueSize: 'small',
            budget: 'mid'
        }
    },
    {
        name: 'The High Roller',
        when: 'I Don\'t Know',
        where: 'Anywhere in Scotland',
        size: 'Quite Big',
        budget: '£50+',
        expectedParams: {
            when: 'dontknow',
            distance: 'scotland',
            venueSize: 'medium',
            budget: 'high'
        }
    },
    {
        name: 'Flexible Future Date',
        when: 'Pick a Date',
        customDate: '2026-01-01',
        where: 'Locally',
        postcode: 'EH3', // Edinburgh
        size: 'Any Size',
        budget: 'Any Price',
        expectedParams: {
            minDate: '2026-01-01',
            distance: 'local',
            postcode: 'EH3',
            venueSize: 'any',
            budget: 'any'
        }
    }
];
