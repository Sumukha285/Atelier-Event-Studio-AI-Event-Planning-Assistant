/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventPresetBundle } from './presets.wedding';

export const BIRTHDAY_PRESET: EventPresetBundle = {
  config: {
    eventType: 'Birthday',
    eventName: 'Elena’s 30th Midnight Velvet & Vinyl Soirée',
    date: '2027-03-14',
    location: 'SoHo Penthouse Loft, New York',
    setting: 'Indoor',
    guestCount: 65,
    currency: 'USD',
    totalBudget: 16500,
    themeVibe: '1970s Milanese Cocktail Lounge & Analog Hi-Fi',
    notes: 'Intimate architectural loft party with vinyl listening bar, chef grazing stations, and midnight champagne tower.',
  },
  concepts: [
    {
      id: 'concept-bday-1',
      title: 'Villa Necchi Listening Lounge',
      tagline: 'Warm walnut hi-fi consoles, velvet banquettes, and Milanese aperitivo bar',
      atmosphereDescription:
        'Transforms the SoHo loft into a tactile Italian collector’s lounge with amber spotlighting, sculptural chrome trays, and vinyl selectors spinning rare groove records.',
      colorPalette: [
        { name: 'Espresso Velvet', hex: '#2C1E18' },
        { name: 'Campari Crimson', hex: '#9E2A2B' },
        { name: 'Brushed Chrome', hex: '#D4D4D8' },
        { name: 'Amber Negroni', hex: '#D97706' },
      ],
      decorIdeas: [
        'Custom printed vinyl record sleeve guestbook and listening station',
        'Sculptural calla lily and dark burgundy anthurium arrangements in chrome vessels',
        'Warm tungsten pin-spots on grazing tables with amber glass votives',
      ],
      entertainmentSuggestions: [
        'All-vinyl hi-fi DJ set with live percussionist accompaniment',
        '35mm point-and-shoot film cameras distributed on cocktail tables',
        'Midnight sabrage champagne tower with custom birthday vinyl pressing',
      ],
      cateringStyle:
        'Interactive Milanese cicchetti & crudo bar, truffle arancini passed on silver trays, and a pistachio-cherry Maritozzo pastry tower.',
      signatureMoment:
        'Midnight champagne tower pour synced to a custom vinyl dubplate intro mixed by the DJ.',
    },
    {
      id: 'concept-bday-2',
      title: 'Chromatic Gallery Supper',
      tagline: 'Architectural communal table with projection art and progressive cocktail pairings',
      atmosphereDescription:
        'A vibrant, design-forward supper club layout where 65 guests dine and mingle around serpentine tables bathed in curated architectural color washes.',
      colorPalette: [
        { name: 'Cobalt Gallery', hex: '#1D4ED8' },
        { name: 'Gallery White', hex: '#F8FAFC' },
        { name: 'Saffron Citrus', hex: '#EAB308' },
        { name: 'Graphite', hex: '#18181B' },
      ],
      decorIdeas: [
        'Architectural projection mapping of guest archival photos on brick loft wall',
        'Color-blocked taper candles and sculptural fruit & ikebana centerpieces',
        'Custom acrylic place tiles doubling as take-home coasters',
      ],
      entertainmentSuggestions: [
        'Live electro-acoustic saxophonist & house selector',
        'Bespoke tarot / aura portrait booth in the mezzanine lounge',
        'Interactive cocktail smoke & botanical garnish bar',
      ],
      cateringStyle:
        'Chef-manned small-plate stations (wagyu yakitori, yuzu sea bass ceviche, handmade agnolotti) and liquid-nitrogen sorbet bar.',
      signatureMoment:
        'Synchronized room lighting shift from warm gallery white to deep cobalt as the birthday cake parade begins.',
    },
    {
      id: 'concept-bday-3',
      title: 'Le Jardin Secret Speakeasy',
      tagline: 'Candlelit greenhouse speakeasy with botanical cocktails and jazz trio',
      atmosphereDescription:
        'Lush indoor palms, antique mirrors, and apothecary cocktail stations create an intimate Parisian late-night salon.',
      colorPalette: [
        { name: 'Absinthe Green', hex: '#14532D' },
        { name: 'Antique Gold', hex: '#B45309' },
        { name: 'Midnight Ink', hex: '#0F172A' },
        { name: 'Pearl Cream', hex: '#F5F5F4' },
      ],
      decorIdeas: [
        'Antique brass candelabras paired with cascading dark ivy and moss runners',
        'Hand-calligraphed apothecary cocktail menu mirror at entry',
        'Velvet lounge vignettes around the loft fireplace',
      ],
      entertainmentSuggestions: [
        '3-piece upright bass, keys, and vocal jazz trio for first two hours',
        'Late-night disco & funk DJ takeover from 22:30 onward',
        'Roaming close-up sleight-of-hand mentalist during cocktail hour',
      ],
      cateringStyle:
        'Raw oyster & champagne raw bar, artisanal charcuterie plinths, braised short rib sliders, and dark chocolate mille-crêpe cake.',
      signatureMoment:
        'Bespoke botanical birthday toast served in vintage etched coupes.',
    },
  ],
  countdownTasks: [
    { id: 'b-task-1', milestone: '6 Months Out', title: 'Reserve SoHo Penthouse Loft & confirm freight elevator hours', category: 'Venue', status: 'Completed', assigneeOrNote: 'Elena · Deposit cleared' },
    { id: 'b-task-2', milestone: '3 Months Out', title: 'Book private chef catering team & mixology bar service', category: 'Catering', status: 'Completed', assigneeOrNote: 'Chef Marco · Menu v2 approved' },
    { id: 'b-task-3', milestone: '1 Month Out', title: 'Send digital RSVP invitations & collect guest song requests', category: 'Logistics', status: 'In Progress', assigneeOrNote: '54 of 65 RSVPs confirmed' },
    { id: 'b-task-4', milestone: '1 Week Out', title: 'Order custom Maritozzo birthday tower & coupe glassware rental', category: 'Catering', status: 'Pending', assigneeOrNote: 'Patisserie order #402' },
    { id: 'b-task-5', milestone: '1 Day Before', title: 'Deliver ice sculptures, specialty spirits, and 35mm table cameras', category: 'Logistics', status: 'Pending', assigneeOrNote: 'Loft Concierge' },
  ],
  itinerary: [
    { id: 'b-itin-1', timeSlot: '18:30', durationMinutes: 90, activity: 'Loft Styling, Hi-Fi Soundcheck & Raw Bar Prep', locationZone: 'Main Loft & Freight Elevator', leadOwner: 'Event Producer', status: 'Completed', notes: 'Test subwoofer isolation pads per building policy.' },
    { id: 'b-itin-2', timeSlot: '20:00', durationMinutes: 60, activity: 'Doors Open, Welcome Negroni Sbagliato & Vinyl Warm-Up', locationZone: 'Gallery Foyer', leadOwner: 'Bar Lead', status: 'Pending', notes: 'Coat check staffed by 2 attendants.' },
    { id: 'b-itin-3', timeSlot: '21:00', durationMinutes: 90, activity: 'Chef Grazing Stations & Candid Film Portraits', locationZone: 'Main Dining Salon', leadOwner: 'Chef Marco', status: 'Pending', notes: 'Pass warm truffle arancini every 20 minutes.' },
    { id: 'b-itin-4', timeSlot: '22:30', durationMinutes: 30, activity: 'Birthday Toast & Champagne Coupe Tower Pour', locationZone: 'Center Hi-Fi Bar', leadOwner: 'Elena + Best Friends', status: 'Pending', notes: 'Photographer positioned on mezzanine steps.' },
    { id: 'b-itin-5', timeSlot: '23:00', durationMinutes: 120, activity: 'Peak Vinyl Disco Set & Late-Night Espresso Service', locationZone: 'Dance Lounge', leadOwner: 'DJ & Saxophonist', status: 'Pending', notes: 'Serve warm sliders at 00:15.' },
  ],
  vendors: [
    {
      id: 'b-vendor-1',
      category: 'Loft Venue & Concierge',
      roleDescription: 'Private penthouse loft buyout with rooftop terrace access and doorman security',
      priority: 'Essential',
      bookingStatus: 'Paid',
      vendorName: 'Mercer Street Penthouse Studio',
      quotedPrice: 3630,
      contactInfo: 'bookings@mercerpenthouse.example',
      vettingQuestions: [
        'What is the decibel limit after 23:00 for residential neighbors below?',
        'Is freight elevator operator staffing included for late-night strike at 01:00?',
        'Are cleaning and trash removal fees included in the base venue rate?',
        'How many watts are available on separate circuits for DJ and catering induction warmers?',
        'Is Certificate of Insurance (COI) required from every outside vendor?',
      ],
      contractRedFlags: [
        'Security deposit forfeiture clause for any sound reading above 80dB inside the room',
        'Hidden $600 freight elevator operator fee after 22:00',
      ],
    },
    {
      id: 'b-vendor-2',
      category: 'Chef Grazing & Craft Mixology',
      roleDescription: 'Interactive Italian aperitivo stations, 2 craft bartenders, and specialty glassware',
      priority: 'Essential',
      bookingStatus: 'Booked',
      vendorName: 'Osteria Nomade Catering',
      quotedPrice: 5610,
      contactInfo: 'events@osterianomade.example',
      vettingQuestions: [
        'Can all menu items be served bite-sized / fork-only without requiring full seated place settings?',
        'Are artisanal ice cubes, dehydrated garnishes, and coupe tower glassware included?',
        'What is the staffing count (chefs, servers, bartenders) for 65 guests?',
        'How do you replenish grazing stations so the display still looks abundant at 22:30?',
        'Are leftover unopened spirits returned to the host at the end of the night?',
      ],
      contractRedFlags: [
        'Glassware breakage billed at 4x retail cost without a standard wear buffer',
        'Bar service cut off 60 minutes prior to event end time',
      ],
    },
  ],
};
