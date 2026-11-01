/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventPresetBundle } from './presets.wedding';

export const COMMUNITY_PRESET: EventPresetBundle = {
  config: {
    eventType: 'Community Event',
    eventName: 'Harborfront Design & Makers Festival',
    date: '2027-08-21',
    location: 'Pier 62 Waterfront Pavilion, Seattle',
    setting: 'Outdoor',
    guestCount: 650,
    currency: 'USD',
    totalBudget: 32000,
    themeVibe: 'Pacific Northwest Craft Pavilion & Sunset Acoustic Stage',
    notes: 'Full-day civic creative market featuring 40 local makers, interactive workshops, food trucks, and waterfront music.',
  },
  concepts: [
    {
      id: 'concept-comm-1',
      title: 'Maritime Craft Commons',
      tagline: 'Modular cedar booths, canvas shade sails, and open-air waterfront workshops',
      atmosphereDescription: 'A welcoming civic festival layout organized into a Maker Promenade, Hands-On Workshop Tent, Local Food Truck Alley, and Sunset Acoustic Stage overlooking the sound.',
      colorPalette: [
        { name: 'Puget Sound Navy', hex: '#0F172A' },
        { name: 'Western Red Cedar', hex: '#B45309' },
        { name: 'Canvas Sail', hex: '#F8FAFC' },
        { name: 'Evergreen Moss', hex: '#15803D' },
      ],
      decorIdeas: [
        '12-foot architectural timber wayfinding totems with printed schedule maps',
        'Overhead canvas sail canopies shading communal picnic tables',
        'Interactive community mural wall painted live by local illustrators',
      ],
      entertainmentSuggestions: [
        'Daytime vinyl and indie-folk acoustic stage powered by solar battery bank',
        'Live ceramic wheel-throwing and botanical cyanotype printmaking workshops',
        'Golden-hour brass ensemble parade along the pier promenade',
      ],
      cateringStyle: 'Curated fleet of 5 local food trucks (wood-fired pizza, salmon tacos, vegan bao, craft coffee, and small-batch ice cream) plus free filtered water refill stations.',
      signatureMoment: 'Sunset pier lantern illumination and community toast recognizing local emerging makers.',
    },
    {
      id: 'concept-comm-2',
      title: 'Civic Innovation & Night Market',
      tagline: 'Twilight street-market atmosphere with illuminated booths and culinary pop-ups',
      atmosphereDescription: 'Inspired by vibrant night markets, featuring warm festoon lighting corridors, live design talks, and bustling culinary stalls.',
      colorPalette: [
        { name: 'Twilight Slate', hex: '#1E293B' },
        { name: 'Lantern Amber', hex: '#F59E0B' },
        { name: 'Vermilion Accent', hex: '#DC2626' },
        { name: 'Chalk White', hex: '#F1F5F9' },
      ],
      decorIdeas: [
        'Suspended warm festoon light grid spanning the 200-foot market spine',
        'Color-coded zone flags for Makers, Food & Beverage, and Kids/Workshop zones',
        'Zero-waste compost and recycling stations with volunteer ambassadors',
      ],
      entertainmentSuggestions: [
        'PechaKucha-style 10-minute lightning talks by local architects and founders',
        'Community DJ collective + live percussionists',
        'Screen-printing station where attendees print festival tote bags on-site',
      ],
      cateringStyle: 'Pan-Pacific night market stalls with reusable bamboo dishware program and local craft cidery garden.',
      signatureMoment: 'Collective countdown illumination of the 200-foot overhead lantern canopy at dusk.',
    },
    {
      id: 'concept-comm-3',
      title: 'Botanical Greenway Pavilion',
      tagline: 'Zero-waste neighborhood festival celebrating urban ecology, art, and acoustic music',
      atmosphereDescription: 'Blends native plant installations, family-friendly maker tables, and a relaxed meadow amphitheater setup.',
      colorPalette: [
        { name: 'Forest Canopy', hex: '#166534' },
        { name: 'Terracotta Clay', hex: '#C2410C' },
        { name: 'Oatmeal Linen', hex: '#F5F5F4' },
        { name: 'Sky Slate', hex: '#475569' },
      ],
      decorIdeas: [
        'Native fern and cedar planter barriers donated to neighborhood parks post-event',
        'Recycled timber stage backdrop with hand-painted typography',
        'Shaded family rest lounge with lawn games and storytelling circle',
      ],
      entertainmentSuggestions: [
        'Acoustic bluegrass and indie singer-songwriter showcase',
        'Seed-bomb making & urban beekeeping educational demonstrations',
        'Community choir performance at opening ceremony',
      ],
      cateringStyle: 'Farm-stand picnic boxes, local bakery sourdough stand, kombucha on tap, and volunteer hospitality tent.',
      signatureMoment: 'Live raffle of maker pieces raising funds for neighborhood youth arts scholarships.',
    },
  ],
  countdownTasks: [
    { id: 'c-task-1', milestone: '6 Months Out', title: 'Submit Special Event Permit & Waterfront Parks reservation', category: 'Logistics', status: 'Completed', assigneeOrNote: 'Civic Operations Lead' },
    { id: 'c-task-2', milestone: '3 Months Out', title: 'Open call for 40 local makers & confirm 5 licensed food trucks', category: 'Catering', status: 'Completed', assigneeOrNote: 'Vendor Curator' },
    { id: 'c-task-3', milestone: '1 Month Out', title: 'Finalize ADA site map, fire lane clearance, and sanitation rental order', category: 'Logistics', status: 'In Progress', assigneeOrNote: 'Site Safety Manager' },
    { id: 'c-task-4', milestone: '1 Week Out', title: 'Conduct volunteer briefing for 25 shift ambassadors', category: 'Logistics', status: 'Pending', assigneeOrNote: 'Volunteer Coordinator' },
    { id: 'c-task-5', milestone: '1 Day Before', title: 'Chalk-mark all 40 10x10 booth footprints & stage power drops', category: 'Venue', status: 'Pending', assigneeOrNote: 'Production Crew' },
  ],
  itinerary: [
    { id: 'c-itin-1', timeSlot: '07:30', durationMinutes: 150, activity: 'Maker Vehicle Load-In, Tent Ballast Check & Stage Soundcheck', locationZone: 'Pier 62 North Gate', leadOwner: 'Site Operations Lead', status: 'Completed', notes: 'Vehicles exit pier deck by 09:30.' },
    { id: 'c-itin-2', timeSlot: '10:00', durationMinutes: 120, activity: 'Festival Gates Open, Maker Market & Morning Coffee Service', locationZone: 'Main Pier Promenade', leadOwner: 'Welcome Team', status: 'Pending', notes: 'Click-counter tracking at gates.' },
    { id: 'c-itin-3', timeSlot: '12:00', durationMinutes: 180, activity: 'Food Truck Alley Peak Service & Live Design Workshops', locationZone: 'Central Plaza', leadOwner: 'Hospitality Lead', status: 'Pending', notes: 'Rotate compost bins at 13:30.' },
    { id: 'c-itin-4', timeSlot: '15:00', durationMinutes: 120, activity: 'Main Stage Maker Lightning Talks & Acoustic Showcase', locationZone: 'Waterfront Amphitheater', leadOwner: 'Stage Manager', status: 'Pending', notes: 'ASL interpreter stage left.' },
    { id: 'c-itin-5', timeSlot: '17:00', durationMinutes: 90, activity: 'Golden Hour Brass Parade & Community Scholarship Raffle', locationZone: 'Sunset Overlook', leadOwner: 'Festival Director', status: 'Pending', notes: 'Load-out begins at 18:45.' },
  ],
  vendors: [
    { id: 'c-vendor-1', category: 'Stage, Audio & Solar Generator Power', roleDescription: '24x16 covered stage, line-array PA, wireless mics, and battery generators', priority: 'Essential', bookingStatus: 'Booked', vendorName: 'Cascadia Civic Production', quotedPrice: 5400, contactInfo: 'production@cascadiacivic.example', vettingQuestions: ['Are stage roof structures wind-rated to 45mph with engineer stamps?', 'How many dedicated 20-amp circuits are distributed?', 'Are ADA cable ramps included for all pedestrian walkways?', 'Is an A1 sound engineer included on-site?', 'What is the rain cover protocol for stage monitors?'], contractRedFlags: ['Lack of wind-load engineering certification', 'Cable ramps billed per linear foot as an add-on'] },
    { id: 'c-vendor-2', category: 'Tenting, Canopy Ballasts & Site Logistics', roleDescription: '40 maker booth canopies with 50lb concrete pier weights, tables, and fencing', priority: 'Essential', bookingStatus: 'Contacted', vendorName: 'Northwest Event Rentals', quotedPrice: 6800, contactInfo: 'quotes@nweventrentals.example', vettingQuestions: ['Do all 10x10 canopies include 50lb non-staking ballast weights per leg?', 'Is same-day Saturday evening strike included?', 'What is the emergency dispatch number during load-in?', 'Are fire-retardant NFPA-701 tags affixed to every tent?', 'Does the quote include crew to distribute weights?'], contractRedFlags: ['Delivering stake-only tents to a concrete pier', 'Curb drop-off without labor for ballast weights'] },
    { id: 'c-vendor-3', category: 'Municipal Permits, Fire Marshal & EMT Standby', roleDescription: 'City Special Event Permit, Parks sound variance, Health Dept sign-off, and 2 EMTs', priority: 'Essential', bookingStatus: 'Booked', vendorName: 'City Special Events Office & Metro EMS', quotedPrice: 2400, contactInfo: 'permits@seattlecivic.example', isPermitOrCompliance: true, vettingQuestions: ['What is the minimum emergency vehicle fire-lane width required?', 'When does the Fire Marshal inspect food truck propane tanks?', 'What are the outdoor amplified sound decibel limits?', 'How many ADA-compliant restrooms are mandated for 650 attendees?', 'Does our General Liability policy require a municipal endorsement rider?'], contractRedFlags: ['Missing 30-day advance filing deadline for health permits', 'Lack of dedicated first-aid tent and clear egress signage'] },
  ],
};
