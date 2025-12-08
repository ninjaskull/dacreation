import { db } from "../server/db";
import { blogPosts } from "../shared/schema";

const sampleBlogPosts = [
  {
    title: "Top 10 Destination Wedding Venues in Rajasthan for 2025",
    slug: "top-destination-wedding-venues-rajasthan-2025",
    excerpt: "Discover the most stunning palace hotels and heritage venues in Rajasthan that will make your destination wedding truly unforgettable.",
    content: `Rajasthan continues to be India's premier destination wedding location, with its majestic palaces, rich heritage, and unparalleled grandeur. Here are the top 10 venues that promise to make your wedding a royal affair.

## 1. Umaid Bhawan Palace, Jodhpur

One of the world's largest private residences, Umaid Bhawan Palace offers an unmatched wedding experience. With its Art Deco architecture and sprawling lawns, it's perfect for couples seeking ultimate luxury.

## 2. Taj Lake Palace, Udaipur

Floating on Lake Pichola, this 18th-century marble palace is pure romance. The sunset views and intimate courtyards create a magical atmosphere for your celebrations.

## 3. The Oberoi Udaivilas, Udaipur

Spread across 30 acres on the banks of Lake Pichola, this luxury resort combines traditional Rajasthani architecture with world-class amenities.

## 4. Rambagh Palace, Jaipur

The former residence of the Maharaja of Jaipur, Rambagh Palace offers 47 acres of beautifully landscaped Mughal gardens perfect for grand wedding celebrations.

## 5. Samode Palace

This 475-year-old palace near Jaipur blends Rajput and Mughal architecture, offering an authentic royal wedding experience.

**Pro Tips for Destination Weddings in Rajasthan:**

- **Best Season:** October to March offers the most pleasant weather
- **Guest Comfort:** Ensure adequate transportation and accommodation arrangements
- **Local Vendors:** Partner with experienced local vendors for decor and catering
- **Permits:** Some heritage properties require special event permits

Planning a destination wedding requires meticulous attention to detail. At DA Creation, we specialize in creating seamless experiences that honor tradition while incorporating contemporary elements.`,
    featuredImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
    author: "DA Creation Team",
    category: "destination",
    tags: ["destination wedding", "Rajasthan", "palace wedding", "luxury wedding", "wedding venues"],
    status: "published",
    isFeatured: true,
    metaTitle: "Top 10 Destination Wedding Venues in Rajasthan 2025 | DA Creation",
    metaDescription: "Explore the best destination wedding venues in Rajasthan including Umaid Bhawan Palace, Taj Lake Palace, and more. Plan your dream royal wedding.",
    publishedAt: new Date("2024-11-15"),
  },
  {
    title: "Corporate Event Trends in India: Hybrid Events and Beyond",
    slug: "corporate-event-trends-india-hybrid-events",
    excerpt: "Explore how hybrid events, AI-powered experiences, and sustainable practices are reshaping corporate gatherings in India.",
    content: `The corporate events landscape in India is evolving rapidly. With the market projected to reach USD 14.3 billion by 2025, businesses are embracing innovative formats and technologies.

## The Rise of Hybrid Events

Hybrid events combining in-person and virtual elements have become the new standard. This format offers:

- **Extended Reach:** Connect with global audiences while maintaining intimate networking
- **Cost Efficiency:** Reduce travel and venue costs for remote participants
- **Flexibility:** Accommodate varying comfort levels and schedules
- **Data Insights:** Gather comprehensive attendee analytics

## AI-Powered Event Experiences

Artificial Intelligence is revolutionizing corporate events:

- **Smart Matchmaking:** AI algorithms connect attendees with relevant networking opportunities
- **Personalized Agendas:** Customized session recommendations based on interests
- **Real-time Translation:** Break language barriers in multinational events
- **Chatbots:** Instant support for attendee queries

## Sustainability Takes Center Stage

Leading companies are prioritizing eco-friendly practices:

- Digital invitations and event apps replacing printed materials
- Carbon offset programs for travel emissions
- Locally sourced catering with plant-based options
- Reusable decor and stage elements

## Popular Corporate Event Formats in 2024

1. **Product Launches:** Immersive experiences combining technology and storytelling
2. **Awards Ceremonies:** Celebrating achievements with style and impact
3. **Team Building Retreats:** Experiential programs fostering collaboration
4. **Conferences:** Knowledge-sharing platforms with engaging formats

At DA Creation, we help businesses create impactful corporate events that align with modern expectations while achieving strategic objectives.`,
    featuredImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
    author: "DA Creation Team",
    category: "corporate",
    tags: ["corporate events", "hybrid events", "AI events", "sustainability", "business events"],
    status: "published",
    isFeatured: false,
    metaTitle: "Corporate Event Trends India 2024: Hybrid Events & AI | DA Creation",
    metaDescription: "Discover the latest corporate event trends in India including hybrid formats, AI integration, and sustainable practices for impactful business gatherings.",
    publishedAt: new Date("2024-10-28"),
  },
  {
    title: "Essential Wedding Planning Timeline: 12-Month Checklist",
    slug: "wedding-planning-timeline-12-month-checklist",
    excerpt: "A comprehensive month-by-month guide to planning your dream Indian wedding, from engagement to the big day.",
    content: `Planning an Indian wedding involves coordinating multiple ceremonies, vendors, and family traditions. This 12-month timeline ensures you don't miss a single detail.

## 12-10 Months Before

**Set the Foundation:**
- Finalize your budget with families
- Create a guest list (typically 200-500+ for Indian weddings)
- Book your wedding planner
- Research and book venue(s) for all ceremonies
- Select auspicious dates with a pandit

## 9-7 Months Before

**Build Your Team:**
- Book photographer and videographer
- Select and book caterers (consider separate for veg/non-veg)
- Choose your decorator
- Start shopping for bridal lehenga
- Book entertainment (DJ, live band, dancers)

## 6-4 Months Before

**Details Matter:**
- Send save-the-dates
- Book makeup artist and mehndi artist
- Finalize wedding cards design
- Plan pre-wedding shoots
- Arrange accommodation for outstation guests
- Book transportation

## 3-2 Months Before

**Final Preparations:**
- Send formal invitations
- Confirm all vendor bookings
- Final fittings for wedding outfits
- Plan bachelor/bachelorette parties
- Finalize music and choreography for sangeet
- Arrange wedding favors

## 1 Month Before

**The Final Countdown:**
- Final menu tasting
- Create detailed day-of timeline
- Confirm headcount with all vendors
- Prepare emergency kit
- Brief wedding party on their roles

## 1 Week Before

**Almost There:**
- Confirm all vendor arrival times
- Final touch-ups on decor plans
- Prepare tips and payments
- Pamper yourself!

**Pro Tip:** Hiring a professional wedding planner can reduce your stress by 80% and often saves money through vendor relationships.`,
    featuredImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    author: "DA Creation Team",
    category: "planning",
    tags: ["wedding planning", "wedding checklist", "Indian wedding", "wedding timeline", "bride to be"],
    status: "published",
    isFeatured: false,
    metaTitle: "Wedding Planning Timeline: 12-Month Checklist for Indian Weddings",
    metaDescription: "Complete 12-month Indian wedding planning checklist. From booking venues to final preparations, ensure your dream wedding is perfectly organized.",
    publishedAt: new Date("2024-09-20"),
  },
  {
    title: "Luxury Wedding Decor Trends: From Minimalist to Maximalist",
    slug: "luxury-wedding-decor-trends-2024",
    excerpt: "Explore the hottest wedding decoration trends from elegant minimalism to opulent maximalism, plus sustainable options.",
    content: `Wedding decor in India is witnessing exciting transformations. Today's couples are creating unique visual narratives that reflect their personalities and love stories.

## The Minimalist Movement

Less is more for couples seeking understated elegance:

- **Neutral Palettes:** Ivory, cream, sage green, and dusty rose
- **Clean Lines:** Geometric structures with organic elements
- **Quality over Quantity:** Fewer, but more impactful statement pieces
- **Natural Materials:** Linen, cotton, wood, and dried florals

## Maximalist Opulence

For those who believe more is more:

- **Rich Color Combinations:** Deep burgundy, emerald, gold, and royal blue
- **Layered Textures:** Velvet, silk, crystals, and metallics
- **Floral Abundance:** Cascading installations and flower walls
- **Dramatic Lighting:** LED screens, projection mapping, and chandeliers

## Trending Elements for 2024

1. **Phool Chaadar Entries:** Floral canopy entrances for brides
2. **Suspended Installations:** Floating flowers and greenery
3. **LED Dance Floors:** Interactive lighting experiences
4. **Fusion Mandaps:** Blending traditional and contemporary
5. **Themed Food Stations:** Chaat counters with custom decor

## Sustainable Decor Options

Eco-conscious couples are choosing:

- Potted plants as centerpieces (guests take them home)
- Upcycled materials for props
- Biodegradable confetti
- Rented instead of bought decor
- Locally sourced seasonal flowers

## Color Palette Inspirations

- **Classic Romance:** Blush pink + ivory + gold
- **Modern Luxury:** Black + white + metallics
- **Tropical Vibes:** Coral + teal + gold
- **Regal Elegance:** Burgundy + navy + champagne

Your wedding decor should tell your story. Work with experienced designers who understand both your vision and practical execution.`,
    featuredImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200",
    author: "DA Creation Team",
    category: "decor",
    tags: ["wedding decor", "luxury wedding", "wedding trends", "minimalist wedding", "decor ideas"],
    status: "published",
    isFeatured: false,
    metaTitle: "Luxury Wedding Decor Trends 2024: Minimalist to Maximalist | DA Creation",
    metaDescription: "Discover 2024's top wedding decor trends from elegant minimalism to lavish maximalism. Get inspired for your dream wedding decoration.",
    publishedAt: new Date("2024-08-15"),
  },
  {
    title: "How to Choose the Perfect Wedding Venue in Mumbai",
    slug: "choose-perfect-wedding-venue-mumbai",
    excerpt: "A complete guide to selecting wedding venues in Mumbai, covering banquet halls, hotels, outdoor spaces, and budget considerations.",
    content: `Mumbai, the city of dreams, offers diverse venue options for every type of wedding celebration. Here's your comprehensive guide to finding the perfect spot.

## Types of Wedding Venues in Mumbai

### 5-Star Hotel Ballrooms

**Best For:** All-weather celebrations, luxury weddings
**Capacity:** 300-1500 guests
**Popular Choices:** Taj Lands End, The St. Regis, Four Seasons

**Pros:**
- Professional event coordination
- Multiple package options
- In-house catering excellence
- Guest accommodation

**Cons:**
- Higher pricing
- Less customization in decor

### Banquet Halls

**Best For:** Traditional celebrations, budget flexibility
**Capacity:** 200-2000 guests
**Popular Areas:** Andheri, Bandra, Kandivali

**Pros:**
- Flexible pricing
- Outside catering allowed
- Full decor customization

**Cons:**
- Variable quality
- Weather dependent (some)

### Outdoor Venues

**Best For:** Sunset ceremonies, garden weddings
**Capacity:** Varies widely
**Popular Choices:** Turf clubs, farmhouses, beach resorts

**Pros:**
- Natural beauty
- Unique photo opportunities
- Customizable layouts

**Cons:**
- Monsoon restrictions (June-September)
- Backup plans needed

## Key Questions to Ask Venues

1. What is included in the venue rental?
2. Are there any hidden costs (electricity, parking, security)?
3. What is the cancellation policy?
4. Can we bring outside vendors?
5. What are the noise/timing restrictions?
6. Is there a backup indoor option?

## Budget Considerations

**Venue cost typically includes:**
- Space rental
- Basic lighting
- Furniture setup
- Washroom facilities
- Parking

**Additional costs to budget:**
- Decor and florals
- Catering
- Entertainment
- Photography
- Generator backup

## Pro Tips for Mumbai Weddings

- Book 12-18 months in advance for peak season (November-February)
- Visit venues at the same time your event will be held
- Check traffic patterns for guest convenience
- Ensure adequate power backup

Let our team help you discover the perfect venue that matches your vision and budget.`,
    featuredImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
    author: "DA Creation Team",
    category: "weddings",
    tags: ["Mumbai wedding", "wedding venue", "wedding planning", "banquet hall", "luxury venue"],
    status: "published",
    isFeatured: false,
    metaTitle: "How to Choose Perfect Wedding Venue in Mumbai | Complete Guide",
    metaDescription: "Guide to selecting the perfect wedding venue in Mumbai. Compare hotels, banquet halls, outdoor venues with budget tips and key questions to ask.",
    publishedAt: new Date("2024-07-22"),
  },
  {
    title: "The Complete Guide to Sangeet Night: Music, Dance & Entertainment",
    slug: "complete-guide-sangeet-night-entertainment",
    excerpt: "Plan an unforgettable sangeet ceremony with tips on choreography, music selection, performances, and modern entertainment ideas.",
    content: `The sangeet ceremony has evolved from a simple musical evening to an elaborate entertainment extravaganza. Here's how to create a memorable night for your guests.

## Planning Your Sangeet Performances

### Family Performances

The heart of any sangeet is family involvement:

- Start planning choreography 2-3 months in advance
- Keep dance routines simple for beginners
- Include all age groups in group performances
- Consider surprise performances for the couple

### Professional Entertainment

Elevate your sangeet with:

- **Dance Troupes:** Bollywood, folk, or fusion performances
- **Celebrity Appearances:** Musicians or performers
- **Live Bands:** Jazz, Bollywood covers, or classical
- **Anchors/MCs:** Keep the energy high throughout

## Music Selection Tips

**For Dance Performances:**
- Mix old classics with new hits
- Include songs meaningful to the couple
- Balance fast and slow numbers
- Create mashups for impact

**Popular Sangeet Songs 2024:**
- Kala Chashma
- London Thumakda
- Gallan Goodiyaan
- Chaiyya Chaiyya
- Contemporary hits from latest movies

## Unique Entertainment Ideas

1. **Flash Mob:** Surprise the couple with a choreographed routine
2. **Couple Games:** Fun activities involving families
3. **Video Montages:** Journey of the couple's relationship
4. **Photo Booths:** Props and backdrops for guests
5. **LED Dance Floors:** Interactive lighting experiences
6. **Drone Photography:** Capture aerial views of performances

## Decor and Setup

**Stage Requirements:**
- Adequate space for group dances (15-20 ft minimum)
- Quality sound system
- Professional lighting
- Backup equipment

**Seating Arrangements:**
- Clear view of stage for all guests
- Comfortable seating for elderly
- Space for impromptu dancing

## Timeline for the Evening

- 7:00 PM - Guests arrive, cocktails
- 7:30 PM - Welcome and opening act
- 8:00 PM - Family performances begin
- 9:00 PM - Professional entertainment
- 9:30 PM - Couple games and activities
- 10:00 PM - Dinner service
- 11:00 PM - Open dance floor
- 12:00 AM - Wrap up

**Pro Tip:** Hire a professional choreographer who can work with family members of all skill levels and create cohesive, entertaining performances.`,
    featuredImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
    author: "DA Creation Team",
    category: "weddings",
    tags: ["sangeet", "wedding entertainment", "Indian wedding", "dance performance", "wedding music"],
    status: "published",
    isFeatured: false,
    metaTitle: "Complete Guide to Sangeet Night: Music, Dance & Entertainment Ideas",
    metaDescription: "Plan the perfect sangeet ceremony with tips on choreography, music selection, professional entertainment, and unique ideas for an unforgettable night.",
    publishedAt: new Date("2024-06-18"),
  },
];

async function seedBlogPosts() {
  console.log("Seeding blog posts...");
  
  try {
    for (const post of sampleBlogPosts) {
      await db.insert(blogPosts).values(post as any).onConflictDoNothing();
      console.log(`Created: ${post.title}`);
    }
    
    console.log("\nBlog posts seeded successfully!");
    console.log(`Total posts created: ${sampleBlogPosts.length}`);
  } catch (error) {
    console.error("Error seeding blog posts:", error);
    throw error;
  }
}

seedBlogPosts().then(() => process.exit(0)).catch(() => process.exit(1));
