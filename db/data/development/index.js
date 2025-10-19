module.exports = {
  users: [
  { email: "staff@community.org", name: "Staff Member", is_staff: true,  password: "staffpass" },
  { email: "alice@example.com",    name: "Alice",        is_staff: false, password: "alicepass" }
],
  events: [
  //MUSIC 
  {
    title: "The Weeknd Tribute Night",
    description: "A night of hits from After Hours to Dawn FM with a live band and visuals.",
    location: "O2 Academy Brixton, London",
    startOffsetHours: 48,
    durationMinutes: 120,
    price_type: "FIXED",
    price_pence: 3500,
    created_by_email: "staff@community.org",
    category: "MUSIC",
    image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "City Sounds: Indie Showcase",
    description: "Four emerging indie bands share the stage for a high-energy evening.",
    location: "Band on the Wall, Manchester",
    startOffsetHours: 96,
    durationMinutes: 150,
    price_type: "PAY_AS_YOU_FEEL",
    created_by_email: "staff@community.org",
    category: "MUSIC",
    image_url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Jazz by Candlelight",
    description: "Intimate jazz standards performed under soft candlelight.",
    location: "The Jazz Cafe, London",
    startOffsetHours: 168,
    durationMinutes: 90,
    price_type: "FIXED",
    price_pence: 2200,
    created_by_email: "staff@community.org",
    category: "MUSIC",
    image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Lo-Fi Beats Night",
    description: "Chill beatmakers and vinyl DJs for a laid-back late session.",
    location: "Headrow House, Leeds",
    startOffsetHours: 210,
    durationMinutes: 180,
    price_type: "FREE",
    created_by_email: "staff@community.org",
    category: "MUSIC",
    image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Symphonic Pop: Orchestra Plays the 2010s",
    description: "A modern orchestra reimagines chart-toppers from the last decade.",
    location: "Sage Gateshead, Newcastle",
    startOffsetHours: 288,
    durationMinutes: 120,
    price_type: "FIXED",
    price_pence: 4800,
    created_by_email: "staff@community.org",
    category: "MUSIC",
    image_url: "https://images.unsplash.com/photo-1513815977113-49d9d2db2d39?q=80&w=1400&auto=format&fit=crop"
  },

  //SPORT
  {
    title: "Community 5-a-side Football",
    description: "Casual 5-a-side—bring boots and good vibes. Mixed skill levels welcome.",
    location: "Powerleague, Shoreditch",
    startOffsetHours: 36,
    durationMinutes: 90,
    price_type: "PAY_AS_YOU_FEEL",
    created_by_email: "staff@community.org",
    category: "SPORT",
    image_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Parkrun Plus: 10k Social",
    description: "Group 10k with pacers and post-run coffee.",
    location: "Hyde Park, London",
    startOffsetHours: 60,
    durationMinutes: 80,
    price_type: "FREE",
    created_by_email: "staff@community.org",
    category: "SPORT",
    image_url: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Beginner’s Climbing Session",
    description: "Intro to bouldering—technique, safety, and first climbs.",
    location: "The Climbing Hangar, Liverpool",
    startOffsetHours: 132,
    durationMinutes: 120,
    price_type: "FIXED",
    price_pence: 1800,
    created_by_email: "staff@community.org",
    category: "SPORT",
    image_url: "https://images.unsplash.com/photo-1517957444886-3b3b54f6a4d2?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Evening Yoga in the Park",
    description: "All-levels vinyasa flow at sunset. Bring a mat.",
    location: "Kelvingrove Park, Glasgow",
    startOffsetHours: 174,
    durationMinutes: 75,
    price_type: "PAY_AS_YOU_FEEL",
    created_by_email: "staff@community.org",
    category: "SPORT",
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Table Tennis Ladder Night",
    description: "Friendly ladder format—climb the ranks across the evening.",
    location: "Bounce, Farringdon",
    startOffsetHours: 252,
    durationMinutes: 150,
    price_type: "FIXED",
    price_pence: 1200,
    created_by_email: "staff@community.org",
    category: "SPORT",
    image_url: "https://images.unsplash.com/photo-1603293622643-01a4bd86f3b3?q=80&w=1400&auto=format&fit=crop"
  },

  // ARTS
  {
    title: "Stand-Up Comedy Open Mic",
    description: "New acts and polished pros; 5-7 minute sets, fast turnover.",
    location: "The Bill Murray, London",
    startOffsetHours: 24,
    durationMinutes: 120,
    price_type: "PAY_AS_YOU_FEEL",
    created_by_email: "staff@community.org",
    category: "ARTS",
    image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Improv Jam: Make It Up",
    description: "Warm-ups, scenes, and a friendly show-up-and-play format.",
    location: "Wardrobe Theatre, Bristol",
    startOffsetHours: 84,
    durationMinutes: 120,
    price_type: "FREE",
    created_by_email: "staff@community.org",
    category: "ARTS",
    image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Watercolour for Beginners",
    description: "A guided workshop covering washes, gradients, and simple compositions.",
    location: "Whitworth Art Gallery, Manchester",
    startOffsetHours: 120,
    durationMinutes: 150,
    price_type: "FIXED",
    price_pence: 2000,
    created_by_email: "staff@community.org",
    category: "ARTS",
    image_url: "https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Shakespeare in the Courtyard",
    description: "Outdoor abridged performance with a minimal set and live music.",
    location: "Oxford Castle Courtyard, Oxford",
    startOffsetHours: 192,
    durationMinutes: 130,
    price_type: "FIXED",
    price_pence: 2600,
    created_by_email: "staff@community.org",
    category: "ARTS",
    image_url: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Photography Walk: Night Neon",
    description: "City lights, long exposures, and street scenes with a pro mentor.",
    location: "Northern Quarter, Manchester",
    startOffsetHours: 276,
    durationMinutes: 120,
    price_type: "PAY_AS_YOU_FEEL",
    created_by_email: "staff@community.org",
    category: "ARTS",
    image_url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1400&auto=format&fit=crop"
  },

  //FAMILY 
  {
    title: "Family Movie Afternoon",
    description: "Animated classic on the big screen—free squash and popcorn.",
    location: "Community Hall, Brighton",
    startOffsetHours: 30,
    durationMinutes: 120,
    price_type: "FREE",
    created_by_email: "staff@community.org",
    category: "FAMILY",
    image_url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "STEM Tinker Lab",
    description: "Kid-friendly circuits and build-a-bot stations (ages 7–12).",
    location: "ThinkTank, Birmingham",
    startOffsetHours: 72,
    durationMinutes: 120,
    price_type: "FIXED",
    price_pence: 1500,
    created_by_email: "staff@community.org",
    category: "FAMILY",
    image_url: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Storytime in the Park",
    description: "Interactive storytelling with puppets and songs (under-6s).",
    location: "Princes Street Gardens, Edinburgh",
    startOffsetHours: 108,
    durationMinutes: 60,
    price_type: "FREE",
    created_by_email: "staff@community.org",
    category: "FAMILY",
    image_url: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Lego Build Challenge",
    description: "Team up for timed builds and creative prompts—prizes for flair.",
    location: "Discovery Museum, Newcastle",
    startOffsetHours: 156,
    durationMinutes: 90,
    price_type: "PAY_AS_YOU_FEEL",
    created_by_email: "staff@community.org",
    category: "FAMILY",
    image_url: "https://images.unsplash.com/photo-1601758064135-44a2cd7e09cc?q=80&w=1400&auto=format&fit=crop"
  },
  {
    title: "Mini Gardeners Workshop",
    description: "Plant seeds, paint pots, and learn about pollinators.",
    location: "Botanic Gardens, Belfast",
    startOffsetHours: 240,
    durationMinutes: 75,
    price_type: "FIXED",
    price_pence: 800,
    created_by_email: "staff@community.org",
    category: "FAMILY",
    image_url: "https://images.unsplash.com/photo-1518732714860-b62714ce0f1a?q=80&w=1400&auto=format&fit=crop"
  }
]
};
