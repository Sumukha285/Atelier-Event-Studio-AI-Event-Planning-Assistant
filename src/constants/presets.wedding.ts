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
      cateringStyle: 'Extended Italian aperitivo grazing tables (artisanal cheeses, crudo bar, wood-fired pizzettes) followed by handmade pasta courses.',
      signatureMoment: 'Tableside millefoglie pastry assembly by the chef team with sparklers and espresso service.',
    },
  ],
  countdownTasks: [
    { id: 'w-task-1', milestone: '6 Months Out', title: 'Execute conservatory venue contract & pay 50% deposit', category: 'Venue', status: 'Completed', assigneeOrNote: 'Clara & Julian · Signed with site manager' },
    { id: 'w-task-2', milestone: '6 Months Out', title: 'Book lead farm-to-table caterer & lock seasonal tasting date', category: 'Catering', status: 'Completed', assigneeOrNote: 'Lead Planner · Tasting scheduled' },
    { id: 'w-task-3', milestone: '6 Months Out', title: 'Secure documentary wedding photographer & Super-8 videographer', category: 'Photography', status: 'Completed', assigneeOrNote: 'Julian · Retainer paid' },
    { id: 'w-task-4', milestone: '3 Months Out', title: 'Finalize floral architecture proposal & linen swatch approvals', category: 'Decor', status: 'In Progress', assigneeOrNote: 'Floral Studio · Reviewing olive tree rental count' },
    { id: 'w-task-5', milestone: '3 Months Out', title: 'Send formal invitations & launch dietary RSVP tracker', category: 'Logistics', status: 'In Progress', assigneeOrNote: 'Clara · 140 invitations printed' },
    { id: 'w-task-6', milestone: '1 Month Out', title: 'Conduct on-site lighting & acoustics walkthrough at sunset', category: 'Venue', status: 'Pending', assigneeOrNote: 'AV Lead + Venue Coordinator' },
    { id: 'w-task-7', milestone: '1 Month Out', title: 'Lock final beverage order & bar staffing ratios (1 bartender per 45 guests)', category: 'Catering', status: 'Pending', assigneeOrNote: 'Beverage Director' },
    { id: 'w-task-8', milestone: '1 Week Out', title: 'Submit guaranteed final headcount & allergen seating chart to kitchen', category: 'Catering', status: 'Pending', assigneeOrNote: 'Lead Planner' },
    { id: 'w-task-9', milestone: '1 Week Out', title: 'Distribute master Run-of-Show & load-in dock map to all vendors', category: 'Logistics', status: 'Pending', assigneeOrNote: 'Day-of Coordinator' },
    { id: 'w-task-10', milestone: '1 Day Before', title: 'Ceremony processional rehearsal & soundcheck with string duo', category: 'Entertainment', status: 'Pending', assigneeOrNote: 'Wedding Party + Officiant' },
    { id: 'w-task-11', milestone: '1 Day Before', title: 'Prepare vendor gratuity envelopes, marriage license, and emergency kit', category: 'Logistics', status: 'Pending', assigneeOrNote: 'Best Person / Maid of Honor' },
  ],
  itinerary: [
    { id: 'w-itin-1', timeSlot: '14:00', durationMinutes: 120, activity: 'Vendor Load-In, Floral Rigging & Table Linen Dressing', locationZone: 'North Loading Dock & Glasshouse', leadOwner: 'Lead Coordinator', status: 'Completed', notes: 'Verify 400 pillar candles are in hurricane glass sleeves per fire code.' },
    { id: 'w-itin-2', timeSlot: '16:00', durationMinutes: 60, activity: 'First Look & Editorial Couple Portraits in Botanical Gardens', locationZone: 'West Fern Courtyard', leadOwner: 'Lead Photographer', status: 'In Progress', notes: 'Keep family staged near conservatory steps at 16:35.' },
    { id: 'w-itin-3', timeSlot: '17:00', durationMinutes: 30, activity: 'Guest Arrival, Welcome Botanical Spritz & String Prelude', locationZone: 'South Glasshouse Entry', leadOwner: 'Hospitality Team', status: 'Pending', notes: 'Shuttle Bus #1 and #2 arrive from boutique hotel at 16:55.' },
    { id: 'w-itin-4', timeSlot: '17:30', durationMinutes: 35, activity: 'Conservatory Ceremony & Vow Exchange', locationZone: 'Main Orangery Nave', leadOwner: 'Officiant + Sound Tech', status: 'Pending', notes: 'Cue wireless lapel mic #1 and #2; recessional song on vinyl cue.' },
    { id: 'w-itin-5', timeSlot: '18:05', durationMinutes: 75, activity: 'Golden Hour Aperitivo & Raw Bar on Terrace', locationZone: 'South Limestone Terrace', leadOwner: 'Catering Captain', status: 'Pending', notes: 'Flip ceremony chairs to serpentine banquet placement.' },
    { id: 'w-itin-6', timeSlot: '19:20', durationMinutes: 110, activity: 'Candlelit Harvest Dinner & Welcome Toasts', locationZone: 'Main Orangery Banquet Hall', leadOwner: 'Catering Captain + MC', status: 'Pending', notes: 'Toasts between first and main course (max 4 mins each).' },
    { id: 'w-itin-7', timeSlot: '21:10', durationMinutes: 140, activity: 'First Dance, Vinyl DJ Set & Espresso Martini Cart', locationZone: 'Atrium Dance Floor', leadOwner: 'DJ & Bar Lead', status: 'Pending', notes: 'Transition architectural uplights to warm amber dimmer.' },
    { id: 'w-itin-8', timeSlot: '23:30', durationMinutes: 30, activity: 'Sparkler Send-Off, Guest Shuttles & Strike Load-Out', locationZone: 'Main Drive Circle', leadOwner: 'Lead Coordinator', status: 'Pending', notes: 'Final shuttle departs at 23:45 sharp.' },
  ],
  vendors: [
    {
      id: 'w-vendor-1',
      category: 'Venue & Conservatory Operations',
      roleDescription: 'Exclusive glasshouse & terrace rental, climate control, and bridal suite access',
      priority: 'Essential',
      bookingStatus: 'Paid',
      vendorName: 'Vanguard Glasshouse Estate',
      quotedPrice: 13400,
      contactInfo: 'events@vanguardglasshouse.example',
      vettingQuestions: ['What is the exact load-in and strike window included before overtime fees apply?', 'Are open-flame taper candles permitted if enclosed in glass hurricanes?', 'How does the glasshouse HVAC regulate temperature during sunny May afternoons?', 'Is a dedicated venue facilities tech on-site throughout the entire event?', 'What is the rain backup floorplan for the terrace cocktail hour?'],
      contractRedFlags: ['Uncapped hourly overtime charges ($1,500+/hr) triggered if floral strike runs past midnight', 'Mandatory exclusive in-house AV provider with 35% service markup', 'Lack of clear force majeure or extreme weather rescheduling terms'],
    },
    {
      id: 'w-vendor-2',
      category: 'Culinary & Bar Service',
      roleDescription: 'Seasonal family-style dinner, passed hors d’oeuvres, full bar, and service staff',
      priority: 'Essential',
      bookingStatus: 'Booked',
      vendorName: 'Hearth & Botanica Culinary',
      quotedPrice: 14400,
      contactInfo: 'anna@hearthbotanica.example',
      vettingQuestions: ['What is the server-to-guest ratio for family-style service at 140 guests?', 'Are china, flatware, and stemware included in the per-person quote or rented separately?', 'How are severe nut/celiac allergies plated and tracked during family-style service?', 'Do you offer a corkage option or return policy on unopened wine cases?', 'Are vendor meals for 8 crew members billed at a reduced rate?'],
      contractRedFlags: ['Automatic 24% administrative fee that does not go toward staff gratuities', 'Clause allowing menu substitutions within 14 days without client sign-off', 'Minimum bar spend penalty calculated on initial estimate rather than final RSVP count'],
    },
    {
      id: 'w-vendor-3',
      category: 'Floral & Spatial Styling',
      roleDescription: 'Living olive tree rentals, serpentine table florals, candle styling, and linens',
      priority: 'Essential',
      bookingStatus: 'Contacted',
      vendorName: 'Atelier Moss & Stone',
      quotedPrice: 5760,
      contactInfo: 'studio@mossandstone.example',
      vettingQuestions: ['Can ceremony trees and plinth arrangements be repurposed for the reception layout during cocktail hour?', 'Does the quote include late-night strike and retrieval of rental vessels and candle holders?', 'What is your policy if specific blooms face seasonal supply shortages?', 'Are hurricane glass cylinders and dripless tapers included in the rental line item?', 'How many stylists will be on-site during the 2-hour setup window?'],
      contractRedFlags: ['Full replacement fee charged to client for minor wax residue on rental linens', 'No itemized breakdown between perishable stems and hard-good vessel rentals'],
    },
    {
      id: 'w-vendor-4',
      category: 'Photography & Super-8 Cinema',
      roleDescription: '9 hours documentary coverage, second photographer, and analog film vignette',
      priority: 'Essential',
      bookingStatus: 'Booked',
      vendorName: 'Soren Lindqvist Studio',
      quotedPrice: 4800,
      contactInfo: 'soren@lindqvistphoto.example',
      vettingQuestions: ['Have you photographed inside high-glare glasshouse venues during transition from daylight to candlelight?', 'Who is the specific second shooter assigned to our date?', 'What is the dual-card camera backup and cloud archiving workflow on the night of the wedding?', 'What is the contractual turnaround time for sneak peeks (48 hrs) vs full gallery delivery?', 'Do we receive full high-resolution print release without watermarks?'],
      contractRedFlags: ['Clause permitting studio to substitute the lead photographer at their sole discretion', 'Delivery timeline exceeding 16 weeks without milestone guarantees'],
    },
    {
      id: 'w-vendor-5',
      category: 'Live Music & Vinyl Sound Production',
      roleDescription: 'Ceremony string duo, wireless lapel mics, and reception vinyl DJ + PA system',
      priority: 'Recommended',
      bookingStatus: 'Researching',
      vendorName: 'Analog Room Collective',
      quotedPrice: 4600,
      contactInfo: 'booking@analogroom.example',
      vettingQuestions: ['How do you manage acoustic echo inside a glass-and-iron conservatory so speeches remain crisp?', 'Do you bring a secondary digital backup rig in case turntables experience vibration feedback?', 'Are separate sound systems provided for the ceremony nave, outdoor terrace, and dance floor?', 'How do you handle guest song requests while honoring our do-not-play list?', 'Is liability insurance ($2M aggregate) already on file with the venue?'],
      contractRedFlags: ['Single PA setup requiring 45 minutes of dead silence while moving gear between ceremony and dinner', 'No backup audio engineer listed in case of illness'],
    },
  ],
};
