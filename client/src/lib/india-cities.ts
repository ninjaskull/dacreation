/**
 * Indian Cities Database for Autocomplete
 * Organized by state for context-aware suggestions
 */

export const CITIES_BY_STATE: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Visakhapatnam',
    'Vijayawada',
    'Guntur',
    'Tirupati',
    'Nellore',
    'Kakinada',
    'Rajahmundry',
    'Ongole',
    'Tenali',
    'Hindupur',
  ],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Ziro', 'Bomdila'],
  'Assam': [
    'Guwahati',
    'Silchar',
    'Dibrugarh',
    'Jorhat',
    'Nagaon',
    'Tinsukia',
    'Barpeta',
    'Bongaigaon',
    'Goalpara',
    'Kamrup',
  ],
  'Bihar': [
    'Patna',
    'Gaya',
    'Bhagalpur',
    'Darbhanga',
    'Muzaffarpur',
    'Purnia',
    'Arrah',
    'Chhapra',
    'Munger',
    'Motihari',
  ],
  'Chhattisgarh': [
    'Raipur',
    'Bilaspur',
    'Durg',
    'Bhilai',
    'Rajnandgaon',
    'Raigarh',
    'Jagdalpur',
    'Korba',
    'Baloda Bazar',
  ],
  'Goa': [
    'Panaji',
    'Margao',
    'Vasco da Gama',
    'Mapusa',
    'Ponda',
    'Mormugao',
    'Bicholim',
    'Sanquelim',
    'Pernem',
  ],
  'Gujarat': [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Bhavnagar',
    'Jamnagar',
    'Gandhinagar',
    'Anand',
    'Mehsana',
    'Godhra',
    'Morbi',
    'Navsari',
    'Veraval',
    'Junagadh',
    'Bhuj',
  ],
  'Haryana': [
    'Faridabad',
    'Gurgaon',
    'Hisar',
    'Rohtak',
    'Panipat',
    'Ambala',
    'Yamunanagar',
    'Sonipat',
    'Karnal',
    'Kaithal',
  ],
  'Himachal Pradesh': [
    'Shimla',
    'Solan',
    'Mandi',
    'Kangra',
    'Kullu',
    'Hamirpur',
    'Una',
    'Bilaspur',
    'Chamba',
  ],
  'Jharkhand': [
    'Ranchi',
    'Dhanbad',
    'Jamshedpur',
    'Giridih',
    'Bokaro',
    'Deoghar',
    'Hazaribagh',
    'Koderma',
    'Dumka',
    'Godda',
  ],
  'Karnataka': [
    'Bangalore',
    'Mysore',
    'Belgaum',
    'Mangalore',
    'Hubballi',
    'Shimoga',
    'Gulbarga',
    'Davangere',
    'Bellary',
    'Chitradurga',
    'Hassan',
    'Kodagu',
    'Tumkur',
  ],
  'Kerala': [
    'Kochi',
    'Thiruvananthapuram',
    'Kozhikode',
    'Kottayam',
    'Ernakulam',
    'Thrissur',
    'Malappuram',
    'Kannur',
    'Idukki',
    'Pathanamthitta',
  ],
  'Madhya Pradesh': [
    'Indore',
    'Bhopal',
    'Jabalpur',
    'Ujjain',
    'Gwalior',
    'Sagar',
    'Ratlam',
    'Dewas',
    'Mandsaur',
    'Khandwa',
    'Dhar',
    'Vidisha',
  ],
  'Maharashtra': [
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Aurangabad',
    'Solapur',
    'Kolhapur',
    'Sangli',
    'Satara',
    'Akola',
    'Amravati',
    'Jalgaon',
    'Latur',
    'Wardha',
    'Yavatmal',
  ],
  'Manipur': ['Imphal', 'Ukhrul', 'Churachandpur', 'Bishnupur', 'Thoubal'],
  'Meghalaya': ['Shillong', 'Tura', 'Nongpoh', 'Jowai', 'Baghmara'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Kolasib', 'Champhai'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha', 'Zunheboto'],
  'Odisha': [
    'Bhubaneswar',
    'Cuttack',
    'Rourkela',
    'Berhampur',
    'Balasore',
    'Sambalpur',
    'Dhenkanal',
    'Bargarh',
    'Jharsuguda',
  ],
  'Punjab': [
    'Ludhiana',
    'Amritsar',
    'Jalandhar',
    'Patiala',
    'Bathinda',
    'Hoshiarpur',
    'Sangrur',
    'Moga',
    'Firozpur',
  ],
  'Rajasthan': [
    'Jaipur',
    'Jodhpur',
    'Udaipur',
    'Kota',
    'Ajmer',
    'Bikaner',
    'Alwar',
    'Sikar',
    'Bhilwara',
    'Pali',
    'Chittorgarh',
    'Dungarpur',
  ],
  'Sikkim': ['Gangtok', 'Pelling', 'Namchi', 'Geyzing', 'Ravangla'],
  'Tamil Nadu': [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Salem',
    'Tiruppur',
    'Erode',
    'Dindigul',
    'Kanchipuram',
    'Tirunelveli',
    'Kumbakonam',
    'Nagercoil',
    'Vellore',
  ],
  'Telangana': [
    'Hyderabad',
    'Warangal',
    'Nizamabad',
    'Khammam',
    'Mahbubnagar',
    'Medak',
    'Karimnagar',
    'Adilabad',
  ],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Ambassa', 'Kailashahar'],
  'Uttar Pradesh': [
    'Lucknow',
    'Kanpur',
    'Agra',
    'Varanasi',
    'Meerut',
    'Ghaziabad',
    'Noida',
    'Saharanpur',
    'Aligarh',
    'Mathura',
    'Jhansi',
    'Allahabad',
    'Gorakhpur',
    'Bareilly',
    'Moradabad',
  ],
  'Uttarakhand': [
    'Dehradun',
    'Haridwar',
    'Rishikesh',
    'Roorkee',
    'Haldwani',
    'Almora',
    'Nainital',
    'Pithoragarh',
    'Udham Singh Nagar',
  ],
  'West Bengal': [
    'Kolkata',
    'Asansol',
    'Siliguri',
    'Durgapur',
    'Darjeeling',
    'Jalpaiguri',
    'Kharagpur',
    'Bolpur',
    'Cooch Behar',
  ],
  'Chandigarh': ['Chandigarh'],
  'Dadra and Nagar Haveli': ['Silvassa', 'Dadra'],
  'Daman and Diu': ['Daman', 'Diu'],
  'Lakshadweep': ['Kavaratti'],
  'Puducherry': ['Pondicherry', 'Yanam', 'Mahe', 'Karaikal'],
  'Andaman and Nicobar': ['Port Blair', 'Car Nicobar'],
  'Delhi': ['Delhi', 'New Delhi'],
  'Ladakh': ['Leh', 'Kargil'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Samba'],
};

/**
 * Get all cities from all states
 */
export const ALL_CITIES = Object.values(CITIES_BY_STATE).flat().sort();

/**
 * Search for cities matching a query
 */
export const searchCities = (query: string, state?: string): string[] => {
  if (!query || query.length < 1) {
    return [];
  }

  const normalizedQuery = query.toLowerCase();
  let candidates: string[] = [];

  if (state && CITIES_BY_STATE[state]) {
    candidates = CITIES_BY_STATE[state];
  } else {
    candidates = ALL_CITIES;
  }

  return candidates
    .filter((city) => city.toLowerCase().includes(normalizedQuery))
    .slice(0, 8);
};

/**
 * Get cities for a specific state
 */
export const getCitiesByState = (state: string): string[] => {
  return CITIES_BY_STATE[state] || [];
};

/**
 * Get all states
 */
export const getAllStates = (): string[] => {
  return Object.keys(CITIES_BY_STATE).sort();
};
