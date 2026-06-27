export interface Lead {
  id: number
  business: string
  address: string
  phone: string
  website: string
  rating: number
  reviews: number
  websiteHealth: string
  websiteStatus: string
  primaryEmail: string
  allEmails: string[]
  leadScore: number
  priority: string
}

const businessTypes = {
  cafe: ["Coffee House", "Cafe", "Brew House", "Roasters", "Espresso Bar", "Bistro"],
  restaurant: ["Restaurant", "Diner", "Eatery", "Kitchen", "Grill", "Tavern"],
  salon: ["Salon", "Studio", "Hair & Beauty", "Barbershop", "Spa", "Lounge"],
  gym: ["Gym", "Fitness Center", "Crossfit", "Iron", "Athletics", "Barbell"],
  dentist: ["Dental", "Smiles", "Dental Care", "Orthodontics", "Dental Clinic", "Tooth Care"],
  clinic: ["Clinic", "Healthcare", "Medical Center", "Care", "Health"],
  default: ["Enterprise", "Solutions", "Services", "Group", "Agency", "Co"]
};

export function generateDummyLeads(query: string): Lead[] {
  const q = query.toLowerCase()
  
  // Basic parsing for industry and location
  let industry = "default"
  let location = "City"
  
  // Extract industry
  if (q.includes("cafe") || q.includes("coffee")) industry = "cafe"
  else if (q.includes("restaurant") || q.includes("food")) industry = "restaurant"
  else if (q.includes("salon") || q.includes("hair")) industry = "salon"
  else if (q.includes("gym") || q.includes("fitness")) industry = "gym"
  else if (q.includes("dentist") || q.includes("dental")) industry = "dentist"
  else if (q.includes("clinic") || q.includes("medical")) industry = "clinic"
  
  // Extract location (naive extraction after "in")
  const inIndex = q.indexOf(" in ")
  if (inIndex !== -1) {
    location = query.substring(inIndex + 4).trim()
    // capitalize location
    location = location.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const types = businessTypes[industry as keyof typeof businessTypes]
  
  const leads: Lead[] = []
  
  for (let i = 0; i < 25; i++) {
    const type = types[i % types.length]
    
    // Generate business name
    const prefixes = [location, "Royal", "Central", "Urban", "Prime", "Elite", "Pro", "Elite", "Apex", "Nova"]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const businessName = `${prefix} ${type}`
    
    // Address
    const areas = ["Sector 14", "Downtown", "Connaught Place", "Cyber City", "Phase 2", "Main Street", "High Street"]
    const area = areas[Math.floor(Math.random() * areas.length)]
    const address = `${Math.floor(Math.random() * 900) + 10} ${area}, ${location}`
    
    const hasWebsite = Math.random() > 0.3
    const isLive = hasWebsite && Math.random() > 0.2
    
    const domain = businessName.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com"
    const website = hasWebsite ? `https://${domain}` : "N/A"
    const websiteStatus = hasWebsite ? "HAS_WEBSITE" : "NO_WEBSITE"
    const websiteHealth = !hasWebsite ? "N/A" : (isLive ? "LIVE" : (Math.random() > 0.5 ? "DEAD" : "TIMEOUT"))
    
    const hasEmail = isLive && Math.random() > 0.4
    const email = hasEmail ? `hello@${domain}` : "N/A"
    const allEmails = hasEmail ? [email, `support@${domain}`] : []
    
    const rating = (Math.random() * 2 + 3).toFixed(1)
    const reviews = Math.floor(Math.random() * 1000)
    const phone = `+91 ${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 90000) + 10000}`
    
    // Score based on completeness and health
    let leadScore = Math.floor(Math.random() * 40) + 10 // base
    if (hasWebsite) leadScore += 20
    if (isLive) leadScore += 20
    if (hasEmail) leadScore += 10
    
    const priority = leadScore > 75 ? "HIGH" : leadScore > 40 ? "MEDIUM" : "LOW"

    leads.push({
      id: i + 1,
      business: businessName,
      address,
      phone,
      website,
      rating: parseFloat(rating),
      reviews,
      websiteHealth,
      websiteStatus,
      primaryEmail: email,
      allEmails,
      leadScore,
      priority
    })
  }

  // Sort by score
  return leads.sort((a, b) => b.leadScore - a.leadScore)
}
