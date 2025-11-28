import { db } from "../server/db";
import { 
  users, leads, clients, events, vendors, appointments, 
  activityLogs, leadNotes, teamMembers, companySettings,
  testimonials, portfolioItems, careers, pressArticles, 
  pageContent, userSettings
} from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { sql, eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${derivedKey.toString("hex")}.${salt}`;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function clearSeedData() {
  console.log("🧹 Clearing existing seed data (preserving admin user)...\n");
  
  await db.delete(activityLogs);
  await db.delete(leadNotes);
  await db.delete(appointments);
  await db.delete(events);
  await db.delete(leads);
  await db.delete(clients);
  await db.delete(vendors);
  await db.delete(testimonials);
  await db.delete(portfolioItems);
  await db.delete(careers);
  await db.delete(pressArticles);
  await db.delete(pageContent);
  await db.delete(userSettings);
  await db.delete(teamMembers);
  await db.delete(companySettings);
  await db.delete(users).where(sql`username != 'admin'`);
  
  await db.execute(sql`DELETE FROM invoice_payments`);
  await db.execute(sql`DELETE FROM invoice_items`);
  await db.execute(sql`DELETE FROM invoices`);
  await db.execute(sql`DELETE FROM invoice_templates`);
  
  console.log("   ✓ Cleared all seed data\n");
}

async function seed() {
  console.log("🌱 EventPro Enterprise Database Seed\n");
  console.log("=".repeat(50) + "\n");

  await clearSeedData();

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const twoMonthsLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  console.log("👥 Creating team members...");
  const teamMembersData = [
    { name: "Priya Sharma", role: "Lead Event Planner", bio: "Over 10 years of experience in luxury event planning across India. Specialized in destination weddings and high-profile corporate events.", email: "priya@eventpro.com", phone: "+91 98765 43210", linkedin: "https://linkedin.com/in/priyasharma", instagram: "@priya.events", displayOrder: 1, isActive: true },
    { name: "Rahul Mehta", role: "Operations Manager", bio: "Expert in vendor management, logistics coordination, and on-ground event execution. Managed 200+ successful events.", email: "rahul@eventpro.com", phone: "+91 98765 43211", linkedin: "https://linkedin.com/in/rahulmehta", displayOrder: 2, isActive: true },
    { name: "Ananya Patel", role: "Creative Director", bio: "Award-winning designer with a passion for innovative decor and theme conceptualization. Featured in WeddingSutra Top 50.", email: "ananya@eventpro.com", phone: "+91 98765 43212", instagram: "@ananya.designs", displayOrder: 3, isActive: true },
    { name: "Vikram Singh", role: "Sales Manager", bio: "Building lasting client relationships through personalized service. 15+ years in hospitality and event industry.", email: "vikram@eventpro.com", phone: "+91 98765 43213", linkedin: "https://linkedin.com/in/vikramsingh", displayOrder: 4, isActive: true },
    { name: "Neha Gupta", role: "Event Coordinator", bio: "Detail-oriented coordinator ensuring seamless event execution. Expertise in timeline management and guest coordination.", email: "neha@eventpro.com", phone: "+91 98765 43214", displayOrder: 5, isActive: true },
  ];

  const insertedTeamMembers = await db.insert(teamMembers).values(teamMembersData).returning();
  console.log(`   ✓ Created ${insertedTeamMembers.length} team members`);

  console.log("\n👤 Creating staff users with unique passwords...");
  const staffPasswords = ["Event2024!", "Operations#1", "Creative@Pro", "Sales$Expert", "Coord!nate"];
  const staffUsersData = await Promise.all([
    { username: "priya.sharma", password: await hashPassword(staffPasswords[0]), name: "Priya Sharma", email: "priya@eventpro.com", phone: "+91 98765 43210", role: "staff", isActive: true },
    { username: "rahul.mehta", password: await hashPassword(staffPasswords[1]), name: "Rahul Mehta", email: "rahul@eventpro.com", phone: "+91 98765 43211", role: "staff", isActive: true },
    { username: "ananya.patel", password: await hashPassword(staffPasswords[2]), name: "Ananya Patel", email: "ananya@eventpro.com", phone: "+91 98765 43212", role: "staff", isActive: true },
    { username: "vikram.singh", password: await hashPassword(staffPasswords[3]), name: "Vikram Singh", email: "vikram@eventpro.com", phone: "+91 98765 43213", role: "staff", isActive: true },
    { username: "neha.gupta", password: await hashPassword(staffPasswords[4]), name: "Neha Gupta", email: "neha@eventpro.com", phone: "+91 98765 43214", role: "viewer", isActive: true },
  ].map(async (user) => user));

  const insertedUsers = await db.insert(users).values(staffUsersData).returning();
  console.log(`   ✓ Created ${insertedUsers.length} staff users`);

  const allUsers = await db.select().from(users);
  const staffUserIds = allUsers.map(u => u.id);

  console.log("\n⚙️ Creating user settings...");
  const userSettingsData = allUsers.map(user => ({
    userId: user.id,
    notifyNewLeads: user.role === "admin" || user.role === "staff",
    notifyAppointments: true,
    notifyWeeklyReports: user.role === "admin",
    notifyPayments: user.role === "admin",
    emailNotifications: true,
    theme: randomFromArray(["light", "dark", "system"]),
  }));
  
  await db.insert(userSettings).values(userSettingsData);
  console.log(`   ✓ Created ${userSettingsData.length} user settings`);

  console.log("\n📋 Creating leads with realistic timeline...");
  const leadNames = [
    { name: "Amit Kumar", email: "amit.kumar@gmail.com", phone: "+91 99887 76655" },
    { name: "Sneha Reddy", email: "sneha.reddy@outlook.com", phone: "+91 88776 65544" },
    { name: "Rajesh Iyer", email: "rajesh.iyer@yahoo.com", phone: "+91 77665 54433" },
    { name: "Meera Nair", email: "meera.nair@hotmail.com", phone: "+91 66554 43322" },
    { name: "Karthik Menon", email: "karthik.m@gmail.com", phone: "+91 55443 32211" },
    { name: "Divya Krishnan", email: "divya.k@outlook.com", phone: "+91 44332 21100" },
    { name: "Sanjay Chopra", email: "sanjay.c@gmail.com", phone: "+91 33221 10099" },
    { name: "Pooja Agarwal", email: "pooja.a@yahoo.com", phone: "+91 22110 09988" },
    { name: "Arjun Verma", email: "arjun.v@gmail.com", phone: "+91 11009 98877" },
    { name: "Ritu Bansal", email: "ritu.b@hotmail.com", phone: "+91 99009 88776" },
    { name: "Nikhil Joshi", email: "nikhil.j@gmail.com", phone: "+91 88998 77665" },
    { name: "Kavita Rao", email: "kavita.r@outlook.com", phone: "+91 77887 66554" },
    { name: "Deepak Sharma", email: "deepak.s@gmail.com", phone: "+91 66776 55443" },
    { name: "Anjali Deshmukh", email: "anjali.d@yahoo.com", phone: "+91 55665 44332" },
    { name: "Rohit Malhotra", email: "rohit.m@gmail.com", phone: "+91 44554 33221" },
  ];

  const eventTypes = ["wedding", "corporate", "birthday", "anniversary", "social", "destination"];
  const budgetRanges = ["under-5l", "5l-10l", "10l-25l", "25l-50l", "50l-1cr", "above-1cr"];
  const leadSources = ["website", "inquiry_form", "popup", "chatbot", "lead_magnet", "callback_request"];
  const contactMethods = ["whatsapp", "phone", "email"];
  const locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Jaipur", "Goa", "Udaipur"];

  const leadsData = leadNames.map((lead, index) => {
    let status: string;
    let createdAt: Date;
    let eventDate: Date;
    
    if (index < 3) {
      status = "new";
      createdAt = randomDate(oneWeekAgo, now);
      eventDate = randomDate(twoMonthsLater, sixMonthsLater);
    } else if (index < 6) {
      status = "contacted";
      createdAt = randomDate(twoWeeksAgo, oneWeekAgo);
      eventDate = randomDate(oneMonthLater, threeMonthsLater);
    } else if (index < 9) {
      status = "follow-up";
      createdAt = randomDate(oneMonthAgo, twoWeeksAgo);
      eventDate = randomDate(oneMonthLater, twoMonthsLater);
    } else if (index < 12) {
      status = "qualified";
      createdAt = randomDate(twoMonthsAgo, oneMonthAgo);
      eventDate = randomDate(oneMonthLater, threeMonthsLater);
    } else if (index < 14) {
      status = "converted";
      createdAt = randomDate(threeMonthsAgo, twoMonthsAgo);
      eventDate = randomDate(oneMonthLater, twoMonthsLater);
    } else {
      status = "lost";
      createdAt = randomDate(threeMonthsAgo, twoMonthsAgo);
      eventDate = randomDate(oneMonthLater, threeMonthsLater);
    }
    
    const selectedEventType = eventTypes[index % eventTypes.length];
    
    return {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      eventType: selectedEventType,
      date: eventDate,
      guestCount: Math.floor(Math.random() * 400) + 100,
      location: locations[index % locations.length],
      budgetRange: budgetRanges[index % budgetRanges.length],
      contactMethod: contactMethods[index % contactMethods.length],
      leadSource: leadSources[index % leadSources.length],
      message: `Looking for comprehensive ${selectedEventType} planning services. ${index < 5 ? 'First time organizing a large event.' : 'Have prior experience with event planning.'}`,
      consentGiven: true,
      status,
      notes: status === "qualified" ? "High-value prospect, ready for proposal" : status === "follow-up" ? "Need to follow up next week" : status === "lost" ? "Went with another vendor - price concerns" : null,
      assignedTo: staffUserIds[index % staffUserIds.length],
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.random() * (now.getTime() - createdAt.getTime())),
    };
  });

  const insertedLeads = await db.insert(leads).values(leadsData).returning();
  console.log(`   ✓ Created ${insertedLeads.length} leads`);

  console.log("\n🏢 Creating clients...");
  const convertedLeads = insertedLeads.filter(l => l.status === "converted");
  
  const existingClientsData = [
    { name: "Sharma Family Trust", email: "trust@sharmafamily.com", phone: "+91 98111 22233", company: "Sharma Industries", status: "vip" as const, totalSpent: 2500000, eventsCount: 3, city: "Mumbai", country: "India", tags: ["wedding", "repeat"], source: "referral", notes: "VIP client - requires premium service" },
    { name: "Tech Innovators Pvt Ltd", email: "events@techinnovators.com", phone: "+91 98222 33344", company: "Tech Innovators", status: "active" as const, totalSpent: 1800000, eventsCount: 5, city: "Bangalore", country: "India", tags: ["corporate", "annual"], source: "website", notes: "Annual corporate events partner" },
    { name: "Mehta Celebrations", email: "celebrations@mehta.com", phone: "+91 98333 44455", company: "Mehta Group", status: "active" as const, totalSpent: 3500000, eventsCount: 4, city: "Delhi", country: "India", tags: ["wedding", "premium"], source: "lead_magnet", notes: "High-budget family celebrations" },
    { name: "Gupta Wedding House", email: "info@guptaweddings.com", phone: "+91 98444 55566", company: null, status: "active" as const, totalSpent: 1200000, eventsCount: 2, city: "Jaipur", country: "India", tags: ["wedding"], source: "popup" },
    { name: "Global Corp Events", email: "events@globalcorp.com", phone: "+91 98555 66677", company: "Global Corp India", status: "vip" as const, totalSpent: 5000000, eventsCount: 8, city: "Mumbai", country: "India", tags: ["corporate", "premium", "recurring"], source: "referral", notes: "Preferred vendor for all corporate events" },
  ];

  const convertedClientsData = convertedLeads.map(lead => ({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: "new" as const,
    totalSpent: 0,
    eventsCount: 0,
    city: lead.location || "Mumbai",
    country: "India",
    tags: [lead.eventType],
    source: lead.leadSource,
    notes: `Converted from lead on ${lead.updatedAt?.toISOString().split('T')[0]}`,
  }));

  const allClientsData = [...existingClientsData, ...convertedClientsData];
  const insertedClients = await db.insert(clients).values(allClientsData).returning();
  console.log(`   ✓ Created ${insertedClients.length} clients`);

  console.log("\n🎪 Creating vendors...");
  const vendorsData = [
    { name: "Bloom & Petals Florist", category: "florist", contactName: "Sunita Kapoor", email: "sunita@bloomandpetals.com", phone: "+91 97111 22233", city: "Mumbai", rating: 5, reviewCount: 48, eventsCompleted: 120, priceRange: "₹50,000 - ₹2,00,000", description: "Premium floral arrangements for weddings and events", services: ["Bridal Bouquet", "Stage Decoration", "Centerpieces", "Floral Arches"], status: "active" },
    { name: "Royal Catering Services", category: "catering", contactName: "Chef Ramesh Pillai", email: "ramesh@royalcatering.com", phone: "+91 97222 33344", city: "Delhi", rating: 5, reviewCount: 156, eventsCompleted: 450, priceRange: "₹800 - ₹2,500 per plate", description: "Multi-cuisine catering for large scale events", services: ["North Indian", "South Indian", "Continental", "Chinese", "Live Counters"], status: "active" },
    { name: "Candid Clicks Photography", category: "photography", contactName: "Arun Photographer", email: "arun@candidclicks.com", phone: "+91 97333 44455", city: "Bangalore", rating: 5, reviewCount: 89, eventsCompleted: 280, priceRange: "₹1,50,000 - ₹5,00,000", description: "Award-winning wedding and event photography", services: ["Pre-Wedding Shoot", "Wedding Photography", "Candid Photography", "Drone Shots"], status: "active" },
    { name: "Cinematic Stories", category: "videography", contactName: "Vikrant Films", email: "vikrant@cinematicstories.com", phone: "+91 97444 55566", city: "Mumbai", rating: 4, reviewCount: 67, eventsCompleted: 180, priceRange: "₹2,00,000 - ₹8,00,000", description: "Cinematic wedding films and event coverage", services: ["Wedding Films", "Highlight Reels", "Documentary Style", "Same Day Edit"], status: "active" },
    { name: "DJ Beats Entertainment", category: "entertainment", contactName: "DJ Akash", email: "akash@djbeats.com", phone: "+91 97555 66677", city: "Pune", rating: 4, reviewCount: 112, eventsCompleted: 350, priceRange: "₹50,000 - ₹2,00,000", description: "DJ services and entertainment solutions", services: ["DJ Services", "Sound System", "Lighting", "Dance Floor Setup"], status: "active" },
    { name: "Grand Palace Venue", category: "venue", contactName: "Mr. Rajendra", email: "booking@grandpalace.com", phone: "+91 97666 77788", city: "Jaipur", rating: 5, reviewCount: 203, eventsCompleted: 520, priceRange: "₹5,00,000 - ₹15,00,000", description: "Heritage venue for royal celebrations", services: ["Indoor Venue", "Outdoor Lawn", "Poolside", "Accommodation"], status: "active" },
    { name: "Elegant Decor Studio", category: "decor", contactName: "Priya Decorators", email: "priya@elegantdecor.com", phone: "+91 97777 88899", city: "Chennai", rating: 4, reviewCount: 78, eventsCompleted: 210, priceRange: "₹2,00,000 - ₹10,00,000", description: "Creative event decoration and theme design", services: ["Theme Decor", "Stage Setup", "Lighting Design", "Mandap Decoration"], status: "active" },
    { name: "Sparkle Lights Co", category: "lighting", contactName: "Technical Sanjay", email: "sanjay@sparklelights.com", phone: "+91 97888 99900", city: "Hyderabad", rating: 4, reviewCount: 45, eventsCompleted: 150, priceRange: "₹75,000 - ₹3,00,000", description: "Professional event lighting solutions", services: ["LED Walls", "Fairy Lights", "Chandeliers", "Moving Heads"], status: "active" },
    { name: "Premium Sound Solutions", category: "sound", contactName: "Audio Expert Raj", email: "raj@premiumsound.com", phone: "+91 97999 00011", city: "Mumbai", rating: 5, reviewCount: 92, eventsCompleted: 380, priceRange: "₹40,000 - ₹1,50,000", description: "High-quality audio systems for events", services: ["PA System", "Wireless Microphones", "Recording", "Acoustic Setup"], status: "active" },
    { name: "Royal Rides Transport", category: "transportation", contactName: "Fleet Manager", email: "booking@royalrides.com", phone: "+91 98000 11122", city: "Delhi", rating: 4, reviewCount: 134, eventsCompleted: 450, priceRange: "₹25,000 - ₹1,00,000", description: "Luxury vehicle rentals for events", services: ["Vintage Cars", "Luxury Cars", "Limousines", "Guest Transportation"], status: "active" },
    { name: "Elite Security Services", category: "security", contactName: "Captain Reddy", email: "reddy@elitesecurity.com", phone: "+91 98111 22233", city: "Bangalore", rating: 5, reviewCount: 56, eventsCompleted: 280, priceRange: "₹30,000 - ₹1,00,000", description: "Professional event security services", services: ["Bouncers", "CCTV Monitoring", "VIP Security", "Crowd Management"], status: "active" },
    { name: "Glamour Makeup Studio", category: "makeup", contactName: "Riya Makeup Artist", email: "riya@glamourstudio.com", phone: "+91 98222 33344", city: "Mumbai", rating: 5, reviewCount: 187, eventsCompleted: 420, priceRange: "₹50,000 - ₹2,00,000", description: "Bridal and event makeup services", services: ["Bridal Makeup", "Airbrush Makeup", "Hair Styling", "Draping"], status: "active" },
    { name: "Henna Art by Meena", category: "mehendi", contactName: "Meena Artist", email: "meena@hennaart.com", phone: "+91 98333 44455", city: "Jaipur", rating: 5, reviewCount: 234, eventsCompleted: 680, priceRange: "₹15,000 - ₹75,000", description: "Traditional and contemporary mehendi designs", services: ["Bridal Mehendi", "Arabic Design", "Portrait Mehendi", "Guest Mehendi"], status: "active" },
    { name: "Creative Invites", category: "invitation", contactName: "Designer Kavya", email: "kavya@creativeinvites.com", phone: "+91 98444 55566", city: "Chennai", rating: 4, reviewCount: 98, eventsCompleted: 350, priceRange: "₹25,000 - ₹1,50,000", description: "Custom invitation design and printing", services: ["Digital Invites", "Box Invitations", "Scroll Cards", "E-Invites"], status: "active" },
  ];

  const insertedVendors = await db.insert(vendors).values(vendorsData).returning();
  console.log(`   ✓ Created ${insertedVendors.length} vendors`);

  console.log("\n🎉 Creating events linked to leads and clients...");
  const vipClients = insertedClients.filter(c => c.status === "vip");
  const activeClients = insertedClients.filter(c => c.status === "active");
  const qualifiedLeads = insertedLeads.filter(l => l.status === "qualified");
  
  const eventsData = [
    { name: "Sharma-Kapoor Grand Wedding", type: "wedding", description: "A grand 3-day wedding celebration at a heritage palace", clientId: vipClients[0]?.id, date: randomDate(threeMonthsAgo, twoMonthsAgo), venue: "City Palace", venueAddress: "Udaipur, Rajasthan", guestCount: 500, budget: 5000000, contractAmount: 4500000, paidAmount: 4500000, paymentStatus: "paid", status: "completed", assignedTo: staffUserIds[0], vendorIds: insertedVendors.slice(0, 5).map(v => v.id) },
    { name: "Tech Summit 2024", type: "corporate", description: "Annual technology conference with industry leaders", clientId: activeClients[0]?.id, date: randomDate(twoMonthsAgo, oneMonthAgo), venue: "Bangalore Convention Center", venueAddress: "Bangalore, Karnataka", guestCount: 800, budget: 3000000, contractAmount: 2800000, paidAmount: 2800000, paymentStatus: "paid", status: "completed", assignedTo: staffUserIds[1], vendorIds: insertedVendors.slice(1, 4).map(v => v.id) },
    { name: "Golden Anniversary Celebration", type: "anniversary", description: "50 years of togetherness celebration", clientId: activeClients[1]?.id, date: randomDate(oneMonthAgo, twoWeeksAgo), venue: "The Grand Ballroom", venueAddress: "Delhi, NCR", guestCount: 200, budget: 1500000, contractAmount: 1400000, paidAmount: 1400000, paymentStatus: "paid", status: "completed", assignedTo: staffUserIds[2], vendorIds: insertedVendors.slice(2, 6).map(v => v.id) },
    { name: "Upcoming: Mehta Wedding Festivities", type: "wedding", description: "5-day destination wedding with multiple functions", clientId: vipClients[1]?.id || activeClients[2]?.id, leadId: convertedLeads[0]?.id, date: oneMonthLater, venue: "Taj Lake Palace", venueAddress: "Udaipur, Rajasthan", guestCount: 400, budget: 8000000, contractAmount: 7500000, paidAmount: 3750000, paymentStatus: "partial", status: "confirmed", assignedTo: staffUserIds[0], vendorIds: insertedVendors.slice(0, 8).map(v => v.id) },
    { name: "Corporate Annual Gala", type: "corporate", description: "Annual awards ceremony and gala dinner", clientId: activeClients[3]?.id || vipClients[1]?.id, date: twoWeeksLater, venue: "ITC Grand Central", venueAddress: "Mumbai, Maharashtra", guestCount: 350, budget: 2500000, contractAmount: 2300000, paidAmount: 1150000, paymentStatus: "partial", status: "confirmed", assignedTo: staffUserIds[1], vendorIds: insertedVendors.slice(1, 5).map(v => v.id) },
    { name: "Sweet 16 Birthday Bash", type: "birthday", description: "Glamorous 16th birthday celebration", clientId: activeClients[4]?.id || insertedClients[insertedClients.length - 1]?.id, leadId: qualifiedLeads[0]?.id, date: threeMonthsLater, venue: "The Leela Palace", venueAddress: "Bangalore, Karnataka", guestCount: 150, budget: 800000, contractAmount: 750000, paidAmount: 375000, paymentStatus: "partial", status: "planning", assignedTo: staffUserIds[2], vendorIds: insertedVendors.slice(3, 7).map(v => v.id) },
    { name: "Startup Launch Party", type: "corporate", description: "Product launch event for tech startup", clientId: activeClients[0]?.id, leadId: qualifiedLeads[1]?.id, date: twoMonthsLater, venue: "WeWork Galaxy", venueAddress: "Bangalore, Karnataka", guestCount: 200, budget: 500000, contractAmount: 450000, paidAmount: 0, paymentStatus: "pending", status: "planning", assignedTo: staffUserIds[3], vendorIds: insertedVendors.slice(4, 6).map(v => v.id) },
    { name: "Destination Wedding - Goa", type: "destination", description: "Beach wedding with international guests", clientId: activeClients[2]?.id, leadId: convertedLeads[1]?.id, date: sixMonthsLater, venue: "W Goa", venueAddress: "Vagator, Goa", guestCount: 250, budget: 6000000, contractAmount: 5500000, paidAmount: 2750000, paymentStatus: "partial", status: "confirmed", assignedTo: staffUserIds[0], vendorIds: insertedVendors.slice(0, 10).map(v => v.id) },
    { name: "Navratri Corporate Night", type: "social", description: "Annual Navratri celebration for corporate employees", clientId: vipClients[1]?.id || activeClients[1]?.id, date: twoMonthsLater, venue: "NSCI Dome", venueAddress: "Mumbai, Maharashtra", guestCount: 1000, budget: 1500000, contractAmount: 1400000, paidAmount: 700000, paymentStatus: "partial", status: "planning", assignedTo: staffUserIds[4], vendorIds: insertedVendors.slice(2, 8).map(v => v.id) },
    { name: "Royal Engagement Ceremony", type: "wedding", description: "Traditional engagement ceremony", clientId: insertedClients[insertedClients.length - 2]?.id, leadId: qualifiedLeads[2]?.id, date: oneWeekLater, venue: "Radisson Blu", venueAddress: "Jaipur, Rajasthan", guestCount: 180, budget: 1000000, contractAmount: 950000, paidAmount: 475000, paymentStatus: "partial", status: "confirmed", assignedTo: staffUserIds[2], vendorIds: insertedVendors.slice(5, 10).map(v => v.id) },
  ];

  const insertedEvents = await db.insert(events).values(eventsData).returning();
  console.log(`   ✓ Created ${insertedEvents.length} events`);

  console.log("\n📅 Creating appointments...");
  const appointmentTypes = ["call", "meeting", "video_call", "site_visit"];
  
  const appointmentsData = [
    ...insertedLeads.slice(0, 6).map((lead, index) => ({
      leadId: lead.id,
      assignedTo: staffUserIds[index % staffUserIds.length],
      title: `Discovery Call with ${lead.name}`,
      description: `Initial discussion about ${lead.eventType} requirements`,
      scheduledAt: randomDate(oneWeekLater, twoWeeksLater),
      duration: 30,
      type: "call",
      status: "scheduled",
    })),
    ...insertedLeads.slice(3, 8).map((lead, index) => ({
      leadId: lead.id,
      assignedTo: staffUserIds[index % staffUserIds.length],
      title: `Follow-up Meeting - ${lead.name}`,
      description: `Discuss proposal and pricing details`,
      scheduledAt: randomDate(twoWeeksLater, oneMonthLater),
      duration: 60,
      type: "video_call",
      status: "scheduled",
    })),
    ...insertedLeads.filter(l => l.status === "qualified").slice(0, 3).map((lead, index) => ({
      leadId: lead.id,
      assignedTo: staffUserIds[0],
      title: `Site Visit - ${lead.location}`,
      description: `Venue inspection for ${lead.eventType} event`,
      scheduledAt: randomDate(oneWeekLater, threeMonthsLater),
      duration: 120,
      type: "site_visit",
      status: "scheduled",
    })),
    ...insertedLeads.slice(0, 5).map((lead, index) => ({
      leadId: lead.id,
      assignedTo: staffUserIds[index % staffUserIds.length],
      title: `Completed: Initial Consultation - ${lead.name}`,
      description: `Discussed event requirements and budget`,
      scheduledAt: randomDate(twoMonthsAgo, oneMonthAgo),
      duration: 45,
      type: "meeting",
      status: "completed",
      notes: `Client interested in ${lead.eventType}. Budget range: ${lead.budgetRange}. Follow-up scheduled.`,
    })),
  ];

  const insertedAppointments = await db.insert(appointments).values(appointmentsData).returning();
  console.log(`   ✓ Created ${insertedAppointments.length} appointments`);

  console.log("\n📝 Creating activity logs...");
  const actions = ["status_change", "note_added", "call_made", "email_sent", "meeting_scheduled", "proposal_sent", "follow_up"];
  const outcomes = ["positive", "neutral", "needs_follow_up"];
  
  const activityLogsData = insertedLeads.flatMap((lead, leadIndex) => {
    const numLogs = lead.status === "new" ? 1 : lead.status === "contacted" ? 2 : lead.status === "follow-up" ? 3 : 4;
    return Array.from({ length: numLogs }, (_, logIndex) => ({
      leadId: lead.id,
      userId: staffUserIds[(leadIndex + logIndex) % staffUserIds.length],
      action: actions[logIndex % actions.length],
      details: `${actions[logIndex % actions.length].replace(/_/g, ' ')} for ${lead.name}`,
      outcome: outcomes[logIndex % outcomes.length],
      createdAt: new Date(lead.createdAt!.getTime() + (logIndex + 1) * 24 * 60 * 60 * 1000),
    }));
  });

  const insertedActivityLogs = await db.insert(activityLogs).values(activityLogsData).returning();
  console.log(`   ✓ Created ${insertedActivityLogs.length} activity logs`);

  console.log("\n📌 Creating lead notes...");
  const leadNotesData = insertedLeads.filter(l => ["qualified", "follow-up", "converted"].includes(l.status)).map((lead, index) => ({
    leadId: lead.id,
    userId: staffUserIds[index % staffUserIds.length],
    content: lead.status === "qualified" 
      ? `Priority lead! Has confirmed budget of ${lead.budgetRange}. Event date flexible. Prefers ${lead.contactMethod} communication.`
      : lead.status === "converted"
      ? `Successfully converted to client. Contract signed for ${lead.eventType} event. Great experience working with this lead.`
      : `Needs follow-up. Last contacted on ${randomDate(oneWeekAgo, now).toISOString().split('T')[0]}. Interested but comparing options.`,
    isPinned: lead.status === "qualified",
    createdAt: randomDate(lead.createdAt!, now),
  }));

  const insertedLeadNotes = await db.insert(leadNotes).values(leadNotesData).returning();
  console.log(`   ✓ Created ${insertedLeadNotes.length} lead notes`);

  console.log("\n⚙️ Creating company settings...");
  await db.insert(companySettings).values({
    name: "EventPro Management",
    email: "info@eventpro.com",
    phone: "+91 98765 00000",
    address: "123 Business Park, Bandra Kurla Complex",
    city: "Mumbai",
    country: "India",
    website: "https://eventpro.com",
    taxId: "GSTIN27AABCU9603R1ZZ",
    currency: "INR",
    timezone: "Asia/Kolkata",
    fiscalYearStart: "04",
  });
  console.log(`   ✓ Created company settings`);

  console.log("\n💬 Creating testimonials...");
  const testimonialsData = [
    { clientName: "Priya & Rohit Sharma", clientRole: "Wedding Couple", eventType: "wedding", content: "EventPro made our dream wedding a reality! Every detail was perfect, from the floral arrangements to the lighting. The team's dedication was beyond our expectations. They handled everything with such grace and professionalism.", rating: 5, isFeatured: true, displayOrder: 1 },
    { clientName: "Rajesh Kumar", clientRole: "CEO, Tech Innovators", eventType: "corporate", content: "Our annual tech summit was flawlessly executed by EventPro. Professional team, innovative ideas, and impeccable execution. The conference ran smoothly with 800+ attendees. Highly recommended for corporate events!", rating: 5, isFeatured: true, displayOrder: 2 },
    { clientName: "Meera & Family", clientRole: "Anniversary Celebration", eventType: "anniversary", content: "Celebrating 25 years of togetherness was made extra special by EventPro. They captured our journey beautifully and created an unforgettable evening for our family. Every family member was touched by the thoughtful details.", rating: 5, isFeatured: true, displayOrder: 3 },
    { clientName: "Startup Hub India", clientRole: "Product Launch", eventType: "corporate", content: "Our product launch event exceeded all expectations. The creativity and attention to detail from EventPro helped us make a lasting impression on our stakeholders and media partners.", rating: 4, isFeatured: false, displayOrder: 4 },
    { clientName: "Ananya Gupta", clientRole: "Birthday Girl's Mother", eventType: "birthday", content: "My daughter's 16th birthday party was magical! EventPro understood exactly what we wanted and delivered a party that all the kids are still talking about. The theme execution was perfect!", rating: 5, isFeatured: false, displayOrder: 5 },
  ];

  const insertedTestimonials = await db.insert(testimonials).values(testimonialsData).returning();
  console.log(`   ✓ Created ${insertedTestimonials.length} testimonials`);

  console.log("\n🖼️ Creating portfolio items...");
  const portfolioData = [
    { title: "Royal Palace Wedding", category: "wedding", description: "A grand 3-day celebration at Udaipur's heritage palace with 500+ guests", location: "Udaipur, Rajasthan", date: "November 2024", client: "Sharma Family", isFeatured: true, displayOrder: 1 },
    { title: "Tech Summit 2024", category: "corporate", description: "Annual technology conference for 800+ tech professionals and industry leaders", location: "Bangalore", date: "October 2024", client: "Tech Innovators", isFeatured: true, displayOrder: 2 },
    { title: "Beach Destination Wedding", category: "destination", description: "Intimate beach wedding with international guests and sunset ceremony", location: "Goa", date: "September 2024", client: "Mehta-Kapoor", isFeatured: true, displayOrder: 3 },
    { title: "Corporate Gala Night", category: "corporate", description: "Annual awards ceremony and gala dinner for 350 corporate executives", location: "Mumbai", date: "August 2024", client: "Global Corp India", isFeatured: false, displayOrder: 4 },
    { title: "Golden Jubilee Celebration", category: "anniversary", description: "50th anniversary celebration with 300 guests and a surprise video montage", location: "Delhi", date: "July 2024", client: "Private Family", isFeatured: false, displayOrder: 5 },
  ];

  const insertedPortfolio = await db.insert(portfolioItems).values(portfolioData).returning();
  console.log(`   ✓ Created ${insertedPortfolio.length} portfolio items`);

  console.log("\n💼 Creating career listings...");
  const careersData = [
    { title: "Senior Event Planner", department: "Operations", location: "Mumbai", type: "Full-time", experience: "5+ years", description: "We are looking for an experienced event planner to join our growing team. The ideal candidate will have extensive experience in managing luxury weddings and corporate events.", requirements: ["5+ years event planning experience", "Strong vendor relationships", "Excellent communication skills", "Project management expertise"], benefits: ["Competitive salary", "Health insurance", "Performance bonuses", "Travel opportunities"], salary: "₹8-12 LPA", applicationEmail: "careers@eventpro.com", isActive: true },
    { title: "Event Coordinator", department: "Operations", location: "Delhi", type: "Full-time", experience: "2-4 years", description: "Join our Delhi team as an Event Coordinator. You will be responsible for on-ground coordination and vendor management for various events.", requirements: ["2-4 years experience", "Event coordination skills", "Vendor management", "Attention to detail"], benefits: ["Competitive salary", "Health insurance", "Career growth"], salary: "₹4-6 LPA", applicationEmail: "careers@eventpro.com", isActive: true },
    { title: "Creative Designer", department: "Design", location: "Bangalore", type: "Full-time", experience: "3+ years", description: "We need a creative designer to conceptualize and execute stunning event designs. Experience with wedding and event decoration is essential.", requirements: ["3+ years design experience", "Portfolio of event designs", "3D visualization skills", "Creative thinking"], benefits: ["Competitive salary", "Creative freedom", "Team environment"], salary: "₹5-8 LPA", applicationEmail: "careers@eventpro.com", isActive: true },
    { title: "Sales Executive", department: "Sales", location: "Mumbai", type: "Full-time", experience: "1-3 years", description: "We are expanding our sales team and looking for dynamic individuals who can convert leads into lasting client relationships.", requirements: ["1-3 years sales experience", "Excellent communication", "Target-oriented", "CRM knowledge"], benefits: ["Base salary + commission", "Health insurance", "Incentive trips"], salary: "₹3-5 LPA + incentives", applicationEmail: "careers@eventpro.com", isActive: true },
    { title: "Internship - Event Management", department: "Operations", location: "Mumbai, Delhi, Bangalore", type: "Internship", experience: "Freshers", description: "6-month internship program for students pursuing event management or hospitality. Great opportunity to learn from industry experts.", requirements: ["Currently pursuing degree", "Passion for events", "Good communication", "Willingness to learn"], benefits: ["Stipend provided", "Certificate", "PPO for top performers"], salary: "₹15,000/month", applicationEmail: "careers@eventpro.com", isActive: true },
  ];

  const insertedCareers = await db.insert(careers).values(careersData).returning();
  console.log(`   ✓ Created ${insertedCareers.length} career listings`);

  console.log("\n📰 Creating press articles...");
  const pressData = [
    { title: "EventPro Named Top 10 Wedding Planners in India", publication: "WeddingSutra", publishedDate: "November 2024", excerpt: "EventPro has been recognized as one of the top 10 wedding planning companies in India for their exceptional service and creative excellence.", isFeatured: true, displayOrder: 1, isActive: true },
    { title: "The Art of Destination Weddings: An Interview with EventPro", publication: "Vogue India", publishedDate: "October 2024", excerpt: "Our founder shares insights on the growing trend of destination weddings and how EventPro creates magical experiences across India.", isFeatured: true, displayOrder: 2, isActive: true },
    { title: "Corporate Events Trends 2024: EventPro's Perspective", publication: "Business Today", publishedDate: "September 2024", excerpt: "EventPro's operations head discusses the evolving landscape of corporate events and the importance of experiential marketing.", isFeatured: false, displayOrder: 3, isActive: true },
    { title: "Sustainability in Event Planning", publication: "Economic Times", publishedDate: "August 2024", excerpt: "How EventPro is leading the charge in sustainable event planning practices and eco-friendly celebrations.", isFeatured: false, displayOrder: 4, isActive: true },
  ];

  const insertedPress = await db.insert(pressArticles).values(pressData).returning();
  console.log(`   ✓ Created ${insertedPress.length} press articles`);

  console.log("\n📄 Creating page content...");
  const pageContentData = [
    { pageKey: "home", title: "Welcome to EventPro", subtitle: "Creating Unforgettable Moments", content: "India's premier event management company specializing in luxury weddings, corporate events, and destination celebrations.", metaTitle: "EventPro - Premier Event Management", metaDescription: "EventPro is India's leading event management company offering luxury wedding planning, corporate events, and destination celebrations.", isActive: true },
    { pageKey: "about", title: "About EventPro", subtitle: "Our Story", content: "Founded in 2015, EventPro has grown to become one of India's most trusted event management companies. With a team of passionate professionals, we have successfully executed over 500 events across 20+ cities.", metaTitle: "About Us - EventPro", metaDescription: "Learn about EventPro's journey, our team, and our commitment to creating extraordinary events.", isActive: true },
    { pageKey: "services", title: "Our Services", subtitle: "What We Offer", content: "From intimate gatherings to grand celebrations, we offer comprehensive event planning services including weddings, corporate events, social gatherings, and destination events.", metaTitle: "Event Planning Services - EventPro", metaDescription: "Explore EventPro's comprehensive event planning services including weddings, corporate events, and destination celebrations.", isActive: true },
    { pageKey: "contact", title: "Contact Us", subtitle: "Get In Touch", content: "Ready to plan your next event? Contact our team of expert planners to discuss your vision and get a customized proposal.", metaTitle: "Contact EventPro", metaDescription: "Contact EventPro for your event planning needs. Our team is ready to help you create unforgettable moments.", isActive: true },
  ];

  await db.insert(pageContent).values(pageContentData);
  console.log(`   ✓ Created ${pageContentData.length} page content entries`);

  console.log("\n📄 Creating invoice templates...");
  await db.execute(sql`
    INSERT INTO invoice_templates (name, description, is_default, layout, header_text, footer_text, terms_text, primary_color, accent_color, font_family)
    VALUES 
    ('Standard Invoice', 'Default invoice template for all events', true, 'modern', 'Thank you for choosing EventPro!', 'Payment is due within 30 days of invoice date.', 'All prices are inclusive of applicable taxes unless otherwise stated. Cancellation charges may apply.', '#8B5CF6', '#6366F1', 'Inter'),
    ('Premium Invoice', 'Elegant template for VIP clients', false, 'elegant', 'Premium Event Services by EventPro', 'We appreciate your business and look forward to creating more memories together.', '50% advance payment required to confirm booking. Balance due 7 days before event. Prices exclusive of 18% GST.', '#D4AF37', '#1C1C1C', 'Playfair Display')
  `);
  console.log(`   ✓ Created 2 invoice templates`);

  console.log("\n🧾 Creating sample invoices...");
  const completedEvents = insertedEvents.filter(e => e.status === "completed");
  
  for (let i = 0; i < Math.min(completedEvents.length, 3); i++) {
    const event = completedEvents[i];
    const invoiceNumber = `INV-2024-${String(i + 1).padStart(4, '0')}`;
    
    await db.execute(sql`
      INSERT INTO invoices (invoice_number, client_id, event_id, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, notes)
      VALUES (${invoiceNumber}, ${event.clientId}, ${event.id}, 'paid', ${new Date(event.date!.getTime() - 30 * 24 * 60 * 60 * 1000)}, ${new Date(event.date!.getTime() - 7 * 24 * 60 * 60 * 1000)}, ${event.contractAmount}, 18, ${Math.round(event.contractAmount! * 0.18)}, ${Math.round(event.contractAmount! * 1.18)}, ${'Event completed successfully'})
    `);
    
    const invoiceResult = await db.execute(sql`SELECT id FROM invoices WHERE invoice_number = ${invoiceNumber}`);
    const invoiceId = (invoiceResult.rows[0] as any)?.id;
    
    if (invoiceId) {
      await db.execute(sql`
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total, sort_order)
        VALUES 
        (${invoiceId}, ${'Event Planning & Coordination'}, 1, ${Math.round(event.contractAmount! * 0.4)}, ${Math.round(event.contractAmount! * 0.4)}, 1),
        (${invoiceId}, ${'Vendor Management & Booking'}, 1, ${Math.round(event.contractAmount! * 0.3)}, ${Math.round(event.contractAmount! * 0.3)}, 2),
        (${invoiceId}, ${'Decor & Setup'}, 1, ${Math.round(event.contractAmount! * 0.2)}, ${Math.round(event.contractAmount! * 0.2)}, 3),
        (${invoiceId}, ${'On-Site Coordination'}, 1, ${Math.round(event.contractAmount! * 0.1)}, ${Math.round(event.contractAmount! * 0.1)}, 4)
      `);
      
      await db.execute(sql`
        INSERT INTO invoice_payments (invoice_id, amount, payment_method, payment_date, reference, notes)
        VALUES 
        (${invoiceId}, ${Math.round(event.contractAmount! * 0.59)}, 'bank_transfer', ${new Date(event.date!.getTime() - 45 * 24 * 60 * 60 * 1000)}, ${'TXN-ADV-' + (i + 1)}, ${'50% Advance payment'}),
        (${invoiceId}, ${Math.round(event.contractAmount! * 0.59)}, 'bank_transfer', ${new Date(event.date!.getTime() - 5 * 24 * 60 * 60 * 1000)}, ${'TXN-BAL-' + (i + 1)}, ${'Balance payment'})
      `);
    }
  }
  console.log(`   ✓ Created ${Math.min(completedEvents.length, 3)} sample invoices with items and payments`);

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Database seeding completed successfully!");
  console.log("=".repeat(50));
  console.log("\n📊 Summary:");
  console.log(`   • Team Members: ${insertedTeamMembers.length}`);
  console.log(`   • Staff Users: ${insertedUsers.length}`);
  console.log(`   • User Settings: ${userSettingsData.length}`);
  console.log(`   • Leads: ${insertedLeads.length}`);
  console.log(`   • Clients: ${insertedClients.length}`);
  console.log(`   • Vendors: ${insertedVendors.length}`);
  console.log(`   • Events: ${insertedEvents.length}`);
  console.log(`   • Appointments: ${insertedAppointments.length}`);
  console.log(`   • Activity Logs: ${insertedActivityLogs.length}`);
  console.log(`   • Lead Notes: ${insertedLeadNotes.length}`);
  console.log(`   • Testimonials: ${insertedTestimonials.length}`);
  console.log(`   • Portfolio Items: ${insertedPortfolio.length}`);
  console.log(`   • Career Listings: ${insertedCareers.length}`);
  console.log(`   • Press Articles: ${insertedPress.length}`);
  console.log(`   • Page Content: ${pageContentData.length}`);
  console.log(`   • Invoice Templates: 2`);
  console.log(`   • Sample Invoices: ${Math.min(completedEvents.length, 3)}`);
  console.log("\n🔑 Login credentials:");
  console.log("   Admin: admin / (existing password)");
  console.log("   Staff: priya.sharma / Event2024!");
  console.log("         rahul.mehta / Operations#1");
  console.log("         ananya.patel / Creative@Pro");
  console.log("         vikram.singh / Sales$Expert");
  console.log("         neha.gupta / Coord!nate");
  console.log("\n💡 This script is idempotent - safe to run multiple times.");
}

seed()
  .then(() => {
    console.log("\n✅ Seed completed, exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  });
