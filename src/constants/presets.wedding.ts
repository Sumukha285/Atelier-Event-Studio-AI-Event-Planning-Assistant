/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConceptPackage, CountdownTask, EventConfig, ItineraryItem, VendorItem } from '../types/event.types';

export interface EventPresetBundle {
  readonly config: EventConfig;
  readonly concepts: readonly ConceptPackage[];
  readonly countdownTasks: readonly CountdownTask[];
  readonly itinerary: readonly ItineraryItem[];
  readonly vendors: readonly VendorItem[];
}

export const WEDDING_PRESET: EventPresetBundle = {
  config: {
    eventType: 'Wedding',
    eventName: 'Clara & Julian Conservatory Wedding',
    date: '2027-05-22',
    location: 'Hudson Valley Botanical Glasshouse, NY',
    setting: 'Indoor',
    guestCount: 140,
    currency: 'USD',
    totalBudget: 48000,
    themeVibe: 'Architectural Botanical & Candlelit Modernism',
    notes: 'Evening ceremony inside the historic iron-and-glass orangery followed by long-table courtyard dinner.',
  },
  concepts: [
    {
      id: 'concept-wedding-1',
      title: 'Glasshouse Nocturne',
      tagline: 'Architectural ironwork, towering olive trees, and 400 pillar candles against twilight glass',
      atmosphereDescription: 'Guests enter a warm glass conservatory framed by sculptural Mediterranean foliage, crisp stone linen tablescapes, and low amber candlelight reflecting off the glass roof.',
      colorPalette: [
        { name: 'Obsidian Iron', hex: '#18181B' },
        { name: 'Botanical Cypress', hex: '#2D4A3E' },
        { name: 'Warm Alabaster', hex: '#F5F2EB' },
        { name: 'Champagne Brass', hex: '#C8A97E' },
      ],
      decorIdeas: [
        'Two continuous 60-foot serpentine banquet tables dressed in raw Belgian stone linen',
        'Potted 9-foot olive and fig trees flanking the ceremony aisle (repurposed behind head table)',
        'Hand-poured beeswax taper candles in brushed brass holders with minimal white ranunculus bowls',
      ],
      entertainmentSuggestions: [
        'Amplified cello and harp duo during glasshouse ceremony and transition',
        'Vinyl-only soul, jazz, and French disco DJ set for reception dancing',
        'Late-night espresso martini & digestif cart with acoustic guitarist',
      ],
      cateringStyle: 'Family-style Hudson Valley harvest dinner: wood-fired sourdough, charred heirloom carrots with whipped ricotta, herb-crusted halibut, and tableside tiramisu.',
      signatureMoment: 'Simultaneous lighting of 140 guest table tapers during the first toast as twilight settles over the conservatory.',
    },
    {
      id: 'concept-wedding-2',
      title: 'Editorial Limestone & Silk',
      tagline: 'Monochromatic gallery minimalism with draped silk canopies and chamber music',
      atmosphereDescription: 'Inspired by contemporary sculpture galleries, this concept pairs travertine plinths, suspended sheer ivory silk panels, and architectural calla lily arrangements.',
      colorPalette: [
        { name: 'Travertine Sand', hex: '#E6E1D6' },
        { name: 'Charcoal Slate', hex: '#27272A' },
        { name: 'Raw Silk Ivory', hex: '#FAF8F5' },
        { name: 'Smoked Espresso', hex: '#4A3B32' },
      ],
      decorIdeas: [
        'Ceiling-draped sheer silk panels diffusing overhead atrium light',
        'Fluted travertine floral plinths with structural orchids and anthuriums',
        'Letterpress menu cards on handmade cotton rag paper with wax seals',
      ],
      entertainmentSuggestions: [
        'Contemporary string quartet performing minimalist compositions (Max Richter, Philip Glass)',
        'Curated live jazz quartet transitioning into modern house DJ set',
        'Editorial black-and-white portrait studio corner with medium-format photographer',
      ],
      cateringStyle: 'Four-course plated tasting menu with sommelier-paired biodynamic wines and architectural plated desserts.',
      signatureMoment: 'Champagne coupe tower pour accompanied by a live trumpet solo at the opening of the reception hall.',
    },
    {
      id: 'concept-wedding-3',
      title: 'Estate Orchard Aperitivo',
      tagline: 'Sun-drenched European garden party transitioning into an al fresco lantern banquet',
      atmosphereDescription: 'Warm terracotta textures, citrus trees, and an extended golden-hour aperitivo lounge that flows effortlessly into an intimate candlelit dinner.',
      colorPalette: [
        { name: 'Tuscan Terracotta', hex: '#B85D3B' },
        { name: 'Sage Leaf', hex: '#6B7F6E' },
        { name: 'Linen Cream', hex: '#F7F3E9' },
        { name: 'Sunlit Ochre', hex: '#D99B26' },
      ],
      decorIdeas: [
        'Woven rattan lounge clusters with raw linen parasols for cocktail hour',
        'Potted calamondin citrus and rosemary topiaries along dining tables',
        'Warm filament festoon canopy suspended across the courtyard perimeter',
      ],
      entertainmentSuggestions: [
        'Roaming acoustic gypsy-jazz trio weaving through cocktail tables',
        '7-piece live Motown and funk band for high-energy dance floor',
        'Interactive gelato cart & custom amaro tasting bar',
      ],
      cateringStyle: 'Extended Italian aperitivo grazing tables followed by handmade pasta courses.',
      signatureMoment: 'Tableside millefoglie pastry assembly by the chef team with sparklers and espresso service.',
    },
  ],
  countdownTasks: [
    { id: 'w-task-1', milestone: '6 Months Out', title: 'Execute conservatory venue contract & pay 50% deposit', category: 'Venue', status: 'Completed', assigneeOrNote: 'Clara & Julian' },
    { id: 'w-task-2', milestone: '6 Months Out', title: 'Book lead farm-to-table caterer & lock seasonal tasting date', category: 'Catering', status: 'Completed', assigneeOrNote: 'Lead Planner' },
    { id: 'w-task-3', milestone: '6 Months Out', title: 'Secure documentary wedding photographer & Super-8 videographer', category: 'Photography', status: 'Completed', assigneeOrNote: 'Julian' },
    { id: 'w-task-4', milestone: '3 Months Out', title: 'Finalize floral architecture proposal & linen swatch approvals', category: 'Decor', status: 'In Progress', assigneeOrNote: 'Floral Studio' },
    { id: 'w-task-5', milestone: '3 Months Out', title: 'Send formal invitations & launch dietary RSVP tracker', category: 'Logistics', status: 'In Progress', assigneeOrNote: 'Clara' },
    { id: 'w-task-6', milestone: '1 Month Out', title: 'Conduct on-site lighting & acoustics walkthrough at sunset', category: 'Venue', status: 'Pending', assigneeOrNote: 'AV Lead' },
    { id: 'w-task-7', milestone: '1 Month Out', title: 'Lock final beverage order & bar staffing ratios', category: 'Catering', status: 'Pending', assigneeOrNote: 'Beverage Director' },
    { id: 'w-task-8', milestone: '1 Week Out', title: 'Submit guaranteed final headcount & allergen seating chart to kitchen', category: 'Catering', status: 'Pending', assigneeOrNote: 'Lead Planner' },
    { id: 'w-task-9', milestone: '1 Week Out', title: 'Distribute master Run-of-Show & load-in dock map to all vendors', category: 'Logistics', status: 'Pending', assigneeOrNote: 'Coordinator' },
    { id: 'w-task-10', milestone: '1 Day Before', title: 'Ceremony processional rehearsal & soundcheck with string duo', category: 'Entertainment', status: 'Pending', assigneeOrNote: 'Officiant' },
    { id: 'w-task-11', milestone: '1 Day Before', title: 'Prepare vendor gratuity envelopes, marriage license, and emergency kit', category: 'Logistics', status: 'Pending', assigneeOrNote: 'Best Person' },
  ],
  itinerary: [
    { id: 'w-itin-1', timeSlot: '14:00', durationMinutes: 120, activity: 'Vendor Load-In, Floral Rigging & Table Linen Dressing', locationZone: 'North Loading Dock', leadOwner: 'Lead Coordinator', status: 'Completed', notes: 'Verify hurricane glass sleeves per fire code.' },
    { id: 'w-itin-2', timeSlot: '16:00', durationMinutes: 60, activity: 'First Look & Editorial Couple Portraits in Botanical Gardens', locationZone: 'West Fern Courtyard', leadOwner: 'Lead Photographer', status: 'In Progress', notes: 'Stage family near steps at 16:35.' },
    { id: 'w-itin-3', timeSlot: '17:00', durationMinutes: 30, activity: 'Guest Arrival, Welcome Botanical Spritz & String Prelude', locationZone: 'South Glasshouse Entry', leadOwner: 'Hospitality Team', status: 'Pending', notes: 'Shuttles arrive at 16:55.' },
    { id: 'w-itin-4', timeSlot: '17:30', durationMinutes: 35, activity: 'Conservatory Ceremony & Vow Exchange', locationZone: 'Main Orangery Nave', leadOwner: 'Officiant + Sound Tech', status: 'Pending', notes: 'Cue wireless lapel mics #1 and #2.' },
    { id: 'w-itin-5', timeSlot: '18:05', durationMinutes: 75, activity: 'Golden Hour Aperitivo & Raw Bar on Terrace', locationZone: 'South Limestone Terrace', leadOwner: 'Catering Captain', status: 'Pending', notes: 'Flip chairs to banquet placement.' },
    { id: 'w-itin-6', timeSlot: '19:20', durationMinutes: 110, activity: 'Candlelit Harvest Dinner & Welcome Toasts', locationZone: 'Main Orangery Hall', leadOwner: 'Catering Captain + MC', status: 'Pending', notes: 'Toasts between first and main course.' },
    { id: 'w-itin-7', timeSlot: '21:10', durationMinutes: 140, activity: 'First Dance, Vinyl DJ Set & Espresso Martini Cart', locationZone: 'Atrium Dance Floor', leadOwner: 'DJ & Bar Lead', status: 'Pending', notes: 'Dim uplights to warm amber.' },
    { id: 'w-itin-8', timeSlot: '23:30', durationMinutes: 30, activity: 'Sparkler Send-Off, Guest Shuttles & Strike Load-Out', locationZone: 'Main Drive Circle', leadOwner: 'Lead Coordinator', status: 'Pending', notes: 'Final shuttle departs at 23:45.' },
  ],
  vendors: [
    { id: 'w-vendor-1', category: 'Venue & Conservatory Operations', roleDescription: 'Exclusive glasshouse & terrace rental, climate control, and suite access', priority: 'Essential', bookingStatus: 'Paid', vendorName: 'Vanguard Glasshouse Estate', quotedPrice: 13400, contactInfo: 'events@vanguardglasshouse.example', vettingQuestions: ['What is the exact load-in and strike window before overtime fees apply?', 'Are open-flame taper candles permitted in glass hurricanes?', 'How does the glasshouse HVAC regulate afternoon heat?', 'Is a venue facilities tech on-site throughout?', 'What is the rain backup floorplan?'], contractRedFlags: ['Uncapped hourly overtime charges ($1,500+/hr) past midnight', 'Mandatory exclusive in-house AV with 35% markup'] },
    { id: 'w-vendor-2', category: 'Culinary & Bar Service', roleDescription: 'Seasonal family-style dinner, passed hors d’oeuvres, full bar, and staff', priority: 'Essential', bookingStatus: 'Booked', vendorName: 'Hearth & Botanica Culinary', quotedPrice: 14400, contactInfo: 'anna@hearthbotanica.example', vettingQuestions: ['What is the server-to-guest ratio for 140 guests?', 'Are china, flatware, and stemware included?', 'How are severe allergies plated and tracked?', 'Do you offer a return policy on unopened wine cases?', 'Are vendor crew meals billed at a reduced rate?'], contractRedFlags: ['24% administrative fee excluded from staff gratuities', 'Menu substitutions within 14 days without sign-off'] },
    { id: 'w-vendor-3', category: 'Floral & Spatial Styling', roleDescription: 'Living olive tree rentals, serpentine table florals, candles, and linens', priority: 'Essential', bookingStatus: 'Contacted', vendorName: 'Atelier Moss & Stone', quotedPrice: 5760, contactInfo: 'studio@mossandstone.example', vettingQuestions: ['Can ceremony trees be repurposed for the reception layout?', 'Does the quote include late-night strike and retrieval?', 'What is your policy on seasonal bloom substitutions?', 'Are hurricane cylinders and tapers included?', 'How many stylists will be on-site during setup?'], contractRedFlags: ['Full replacement fee for minor wax residue on linens', 'No itemized breakdown between stems and rentals'] },
    { id: 'w-vendor-4', category: 'Photography & Super-8 Cinema', roleDescription: '9 hours documentary coverage, second shooter, and analog film vignette', priority: 'Essential', bookingStatus: 'Booked', vendorName: 'Soren Lindqvist Studio', quotedPrice: 4800, contactInfo: 'soren@lindqvistphoto.example', vettingQuestions: ['Have you shot inside high-glare glasshouse venues?', 'Who is the specific second shooter assigned?', 'What is the dual-card backup and cloud workflow?', 'What is the turnaround for sneak peeks vs full gallery?', 'Do we receive full high-res print release?'], contractRedFlags: ['Clause allowing lead photographer substitution without notice', 'Delivery timeline exceeding 16 weeks'] },
    { id: 'w-vendor-5', category: 'Live Music & Vinyl Sound Production', roleDescription: 'Ceremony string duo, wireless lapel mics, and reception vinyl DJ + PA', priority: 'Recommended', bookingStatus: 'Researching', vendorName: 'Analog Room Collective', quotedPrice: 4600, contactInfo: 'booking@analogroom.example', vettingQuestions: ['How do you manage acoustic echo inside a glass conservatory?', 'Do you bring a secondary digital backup rig?', 'Are separate sound systems provided for ceremony and terrace?', 'How do you handle song requests vs do-not-play lists?', 'Is $2M liability insurance on file with the venue?'], contractRedFlags: ['Single PA setup requiring 45-min teardown gap', 'No backup audio engineer listed'] },
  ],
};
