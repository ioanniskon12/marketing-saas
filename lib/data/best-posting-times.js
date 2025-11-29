/**
 * Best posting times for different countries and platforms
 * Based on social media engagement research
 */

export const countries = [
  // Europe - Starting with Rome (Italy) as requested
  { code: 'IT-ROM', name: 'Rome (Italy)', timezone: 'Europe/Rome', flag: '🇮🇹', region: 'europe' },
  { code: 'GB-LON', name: 'London (United Kingdom)', timezone: 'Europe/London', flag: '🇬🇧', region: 'europe' },
  { code: 'DE-BER', name: 'Berlin (Germany)', timezone: 'Europe/Berlin', flag: '🇩🇪', region: 'europe' },
  { code: 'FR-PAR', name: 'Paris (France)', timezone: 'Europe/Paris', flag: '🇫🇷', region: 'europe' },
  { code: 'ES-MAD', name: 'Madrid (Spain)', timezone: 'Europe/Madrid', flag: '🇪🇸', region: 'europe' },
  { code: 'ES-BCN', name: 'Barcelona (Spain)', timezone: 'Europe/Madrid', flag: '🇪🇸', region: 'europe' },
  { code: 'NL-AMS', name: 'Amsterdam (Netherlands)', timezone: 'Europe/Amsterdam', flag: '🇳🇱', region: 'europe' },
  { code: 'SE-STO', name: 'Stockholm (Sweden)', timezone: 'Europe/Stockholm', flag: '🇸🇪', region: 'europe' },
  { code: 'GR-ATH', name: 'Athens (Greece)', timezone: 'Europe/Athens', flag: '🇬🇷', region: 'europe' },
  { code: 'PT-LIS', name: 'Lisbon (Portugal)', timezone: 'Europe/Lisbon', flag: '🇵🇹', region: 'europe' },
  { code: 'PL-WAR', name: 'Warsaw (Poland)', timezone: 'Europe/Warsaw', flag: '🇵🇱', region: 'europe' },
  { code: 'CH-ZUR', name: 'Zurich (Switzerland)', timezone: 'Europe/Zurich', flag: '🇨🇭', region: 'europe' },
  { code: 'AT-VIE', name: 'Vienna (Austria)', timezone: 'Europe/Vienna', flag: '🇦🇹', region: 'europe' },
  { code: 'BE-BRU', name: 'Brussels (Belgium)', timezone: 'Europe/Brussels', flag: '🇧🇪', region: 'europe' },
  { code: 'DK-COP', name: 'Copenhagen (Denmark)', timezone: 'Europe/Copenhagen', flag: '🇩🇰', region: 'europe' },
  { code: 'NO-OSL', name: 'Oslo (Norway)', timezone: 'Europe/Oslo', flag: '🇳🇴', region: 'europe' },
  { code: 'FI-HEL', name: 'Helsinki (Finland)', timezone: 'Europe/Helsinki', flag: '🇫🇮', region: 'europe' },
  { code: 'IE-DUB', name: 'Dublin (Ireland)', timezone: 'Europe/Dublin', flag: '🇮🇪', region: 'europe' },
  { code: 'CZ-PRA', name: 'Prague (Czech Republic)', timezone: 'Europe/Prague', flag: '🇨🇿', region: 'europe' },
  { code: 'RO-BUC', name: 'Bucharest (Romania)', timezone: 'Europe/Bucharest', flag: '🇷🇴', region: 'europe' },
  { code: 'HU-BUD', name: 'Budapest (Hungary)', timezone: 'Europe/Budapest', flag: '🇭🇺', region: 'europe' },
  { code: 'BG-SOF', name: 'Sofia (Bulgaria)', timezone: 'Europe/Sofia', flag: '🇧🇬', region: 'europe' },
  { code: 'HR-ZAG', name: 'Zagreb (Croatia)', timezone: 'Europe/Zagreb', flag: '🇭🇷', region: 'europe' },
  { code: 'SK-BRA', name: 'Bratislava (Slovakia)', timezone: 'Europe/Bratislava', flag: '🇸🇰', region: 'europe' },
  { code: 'SI-LJU', name: 'Ljubljana (Slovenia)', timezone: 'Europe/Ljubljana', flag: '🇸🇮', region: 'europe' },
  { code: 'CY-NIC', name: 'Nicosia (Cyprus)', timezone: 'Asia/Nicosia', flag: '🇨🇾', region: 'europe' },
  { code: 'MT-VAL', name: 'Valletta (Malta)', timezone: 'Europe/Malta', flag: '🇲🇹', region: 'europe' },
  { code: 'LU-LUX', name: 'Luxembourg City (Luxembourg)', timezone: 'Europe/Luxembourg', flag: '🇱🇺', region: 'europe' },
  { code: 'IS-REY', name: 'Reykjavik (Iceland)', timezone: 'Atlantic/Reykjavik', flag: '🇮🇸', region: 'europe' },
  { code: 'IT-MIL', name: 'Milan (Italy)', timezone: 'Europe/Rome', flag: '🇮🇹', region: 'europe' },
  { code: 'DE-MUN', name: 'Munich (Germany)', timezone: 'Europe/Berlin', flag: '🇩🇪', region: 'europe' },
  { code: 'ES-VAL', name: 'Valencia (Spain)', timezone: 'Europe/Madrid', flag: '🇪🇸', region: 'europe' },
  { code: 'ES-SEV', name: 'Seville (Spain)', timezone: 'Europe/Madrid', flag: '🇪🇸', region: 'europe' },
  { code: 'FR-MAR', name: 'Marseille (France)', timezone: 'Europe/Paris', flag: '🇫🇷', region: 'europe' },
  { code: 'GB-MAN', name: 'Manchester (United Kingdom)', timezone: 'Europe/London', flag: '🇬🇧', region: 'europe' },

  // United States - Multiple Timezones
  { code: 'US-NY', name: 'New York (United States)', timezone: 'America/New_York', flag: '🇺🇸', region: 'north_america' },
  { code: 'US-LA', name: 'Los Angeles (United States)', timezone: 'America/Los_Angeles', flag: '🇺🇸', region: 'north_america' },
  { code: 'US-CHI', name: 'Chicago (United States)', timezone: 'America/Chicago', flag: '🇺🇸', region: 'north_america' },
  { code: 'US-DEN', name: 'Denver (United States)', timezone: 'America/Denver', flag: '🇺🇸', region: 'north_america' },
  { code: 'US-PHX', name: 'Phoenix (United States)', timezone: 'America/Phoenix', flag: '🇺🇸', region: 'north_america' },
  { code: 'US-MIA', name: 'Miami (United States)', timezone: 'America/New_York', flag: '🇺🇸', region: 'north_america' },
  { code: 'US-SEA', name: 'Seattle (United States)', timezone: 'America/Los_Angeles', flag: '🇺🇸', region: 'north_america' },
  { code: 'US-BOS', name: 'Boston (United States)', timezone: 'America/New_York', flag: '🇺🇸', region: 'north_america' },
  { code: 'US-ATL', name: 'Atlanta (United States)', timezone: 'America/New_York', flag: '🇺🇸', region: 'north_america' },
  { code: 'US-DAL', name: 'Dallas (United States)', timezone: 'America/Chicago', flag: '🇺🇸', region: 'north_america' },

  // Canada - Multiple Timezones
  { code: 'CA-TOR', name: 'Toronto (Canada)', timezone: 'America/Toronto', flag: '🇨🇦', region: 'north_america' },
  { code: 'CA-VAN', name: 'Vancouver (Canada)', timezone: 'America/Vancouver', flag: '🇨🇦', region: 'north_america' },
  { code: 'CA-MTL', name: 'Montreal (Canada)', timezone: 'America/Montreal', flag: '🇨🇦', region: 'north_america' },
  { code: 'CA-CAL', name: 'Calgary (Canada)', timezone: 'America/Edmonton', flag: '🇨🇦', region: 'north_america' },
  { code: 'CA-OTT', name: 'Ottawa (Canada)', timezone: 'America/Toronto', flag: '🇨🇦', region: 'north_america' },

  // Latin America
  { code: 'BR-SP', name: 'São Paulo (Brazil)', timezone: 'America/Sao_Paulo', flag: '🇧🇷', region: 'latin_america' },
  { code: 'BR-RJ', name: 'Rio de Janeiro (Brazil)', timezone: 'America/Sao_Paulo', flag: '🇧🇷', region: 'latin_america' },
  { code: 'BR-BSB', name: 'Brasília (Brazil)', timezone: 'America/Sao_Paulo', flag: '🇧🇷', region: 'latin_america' },
  { code: 'MX-MEX', name: 'Mexico City (Mexico)', timezone: 'America/Mexico_City', flag: '🇲🇽', region: 'latin_america' },
  { code: 'AR-BUE', name: 'Buenos Aires (Argentina)', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷', region: 'latin_america' },
  { code: 'CL-SCL', name: 'Santiago (Chile)', timezone: 'America/Santiago', flag: '🇨🇱', region: 'latin_america' },
  { code: 'CO-BOG', name: 'Bogotá (Colombia)', timezone: 'America/Bogota', flag: '🇨🇴', region: 'latin_america' },
  { code: 'PE-LIM', name: 'Lima (Peru)', timezone: 'America/Lima', flag: '🇵🇪', region: 'latin_america' },
  { code: 'VE-CAR', name: 'Caracas (Venezuela)', timezone: 'America/Caracas', flag: '🇻🇪', region: 'latin_america' },
  { code: 'EC-UIO', name: 'Quito (Ecuador)', timezone: 'America/Guayaquil', flag: '🇪🇨', region: 'latin_america' },
  { code: 'UY-MVD', name: 'Montevideo (Uruguay)', timezone: 'America/Montevideo', flag: '🇺🇾', region: 'latin_america' },

  // Asia
  { code: 'JP-TYO', name: 'Tokyo (Japan)', timezone: 'Asia/Tokyo', flag: '🇯🇵', region: 'asia' },
  { code: 'IN-DEL', name: 'New Delhi (India)', timezone: 'Asia/Kolkata', flag: '🇮🇳', region: 'asia' },
  { code: 'IN-MUM', name: 'Mumbai (India)', timezone: 'Asia/Kolkata', flag: '🇮🇳', region: 'asia' },
  { code: 'IN-BLR', name: 'Bangalore (India)', timezone: 'Asia/Kolkata', flag: '🇮🇳', region: 'asia' },
  { code: 'SG-SIN', name: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬', region: 'asia' },
  { code: 'KR-SEL', name: 'Seoul (South Korea)', timezone: 'Asia/Seoul', flag: '🇰🇷', region: 'asia' },
  { code: 'TH-BKK', name: 'Bangkok (Thailand)', timezone: 'Asia/Bangkok', flag: '🇹🇭', region: 'asia' },
  { code: 'MY-KUL', name: 'Kuala Lumpur (Malaysia)', timezone: 'Asia/Kuala_Lumpur', flag: '🇲🇾', region: 'asia' },
  { code: 'ID-JKT', name: 'Jakarta (Indonesia)', timezone: 'Asia/Jakarta', flag: '🇮🇩', region: 'asia' },
  { code: 'PH-MNL', name: 'Manila (Philippines)', timezone: 'Asia/Manila', flag: '🇵🇭', region: 'asia' },
  { code: 'VN-HAN', name: 'Hanoi (Vietnam)', timezone: 'Asia/Ho_Chi_Minh', flag: '🇻🇳', region: 'asia' },
  { code: 'HK-HKG', name: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: '🇭🇰', region: 'asia' },
  { code: 'TW-TPE', name: 'Taipei (Taiwan)', timezone: 'Asia/Taipei', flag: '🇹🇼', region: 'asia' },
  { code: 'PK-KHI', name: 'Karachi (Pakistan)', timezone: 'Asia/Karachi', flag: '🇵🇰', region: 'asia' },
  { code: 'BD-DAC', name: 'Dhaka (Bangladesh)', timezone: 'Asia/Dhaka', flag: '🇧🇩', region: 'asia' },

  // Middle East
  { code: 'AE-DXB', name: 'Dubai (United Arab Emirates)', timezone: 'Asia/Dubai', flag: '🇦🇪', region: 'middle_east' },
  { code: 'SA-RUH', name: 'Riyadh (Saudi Arabia)', timezone: 'Asia/Riyadh', flag: '🇸🇦', region: 'middle_east' },
  { code: 'IL-TLV', name: 'Tel Aviv (Israel)', timezone: 'Asia/Jerusalem', flag: '🇮🇱', region: 'middle_east' },
  { code: 'TR-IST', name: 'Istanbul (Turkey)', timezone: 'Europe/Istanbul', flag: '🇹🇷', region: 'middle_east' },
  { code: 'EG-CAI', name: 'Cairo (Egypt)', timezone: 'Africa/Cairo', flag: '🇪🇬', region: 'middle_east' },
  { code: 'QA-DOH', name: 'Doha (Qatar)', timezone: 'Asia/Qatar', flag: '🇶🇦', region: 'middle_east' },
  { code: 'KW-KWI', name: 'Kuwait City (Kuwait)', timezone: 'Asia/Kuwait', flag: '🇰🇼', region: 'middle_east' },
  { code: 'BH-BAH', name: 'Manama (Bahrain)', timezone: 'Asia/Bahrain', flag: '🇧🇭', region: 'middle_east' },
  { code: 'OM-MCT', name: 'Muscat (Oman)', timezone: 'Asia/Muscat', flag: '🇴🇲', region: 'middle_east' },
  { code: 'JO-AMM', name: 'Amman (Jordan)', timezone: 'Asia/Amman', flag: '🇯🇴', region: 'middle_east' },
  { code: 'LB-BEY', name: 'Beirut (Lebanon)', timezone: 'Asia/Beirut', flag: '🇱🇧', region: 'middle_east' },

  // Africa
  { code: 'ZA-JNB', name: 'Johannesburg (South Africa)', timezone: 'Africa/Johannesburg', flag: '🇿🇦', region: 'africa' },
  { code: 'NG-LOS', name: 'Lagos (Nigeria)', timezone: 'Africa/Lagos', flag: '🇳🇬', region: 'africa' },
  { code: 'KE-NBO', name: 'Nairobi (Kenya)', timezone: 'Africa/Nairobi', flag: '🇰🇪', region: 'africa' },
  { code: 'GH-ACC', name: 'Accra (Ghana)', timezone: 'Africa/Accra', flag: '🇬🇭', region: 'africa' },
  { code: 'TZ-DAR', name: 'Dar es Salaam (Tanzania)', timezone: 'Africa/Dar_es_Salaam', flag: '🇹🇿', region: 'africa' },
  { code: 'UG-KLA', name: 'Kampala (Uganda)', timezone: 'Africa/Kampala', flag: '🇺🇬', region: 'africa' },
  { code: 'MA-CAS', name: 'Casablanca (Morocco)', timezone: 'Africa/Casablanca', flag: '🇲🇦', region: 'africa' },
  { code: 'DZ-ALG', name: 'Algiers (Algeria)', timezone: 'Africa/Algiers', flag: '🇩🇿', region: 'africa' },
  { code: 'TN-TUN', name: 'Tunis (Tunisia)', timezone: 'Africa/Tunis', flag: '🇹🇳', region: 'africa' },

  // Australia & Oceania
  { code: 'AU-SYD', name: 'Sydney (Australia)', timezone: 'Australia/Sydney', flag: '🇦🇺', region: 'oceania' },
  { code: 'AU-MEL', name: 'Melbourne (Australia)', timezone: 'Australia/Melbourne', flag: '🇦🇺', region: 'oceania' },
  { code: 'AU-BRI', name: 'Brisbane (Australia)', timezone: 'Australia/Brisbane', flag: '🇦🇺', region: 'oceania' },
  { code: 'AU-PER', name: 'Perth (Australia)', timezone: 'Australia/Perth', flag: '🇦🇺', region: 'oceania' },
  { code: 'AU-ADL', name: 'Adelaide (Australia)', timezone: 'Australia/Adelaide', flag: '🇦🇺', region: 'oceania' },
  { code: 'NZ-AKL', name: 'Auckland (New Zealand)', timezone: 'Pacific/Auckland', flag: '🇳🇿', region: 'oceania' },
];

// Region-specific posting times - Best times vary by culture and work patterns
// Based on research from Sprout Social, Hootsuite, and Buffer analytics (2024)
export const bestPostingTimesByRegion = {
  europe: {
    facebook: {
      weekday: [
        { time: '08:00', label: '8:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '17:00', label: '5:00 PM', engagement: 'high' },
      ],
      description: 'Europeans engage heavily during lunch and late evening. Work-life balance results in strong 8 PM engagement.',
    },
    instagram: {
      weekday: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'peak' },
      ],
      description: 'Visual content peaks during European lunch breaks and evening leisure time. Weekend afternoons are golden.',
    },
    twitter: {
      weekday: [
        { time: '08:00', label: '8:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '18:00', label: '6:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '17:00', label: '5:00 PM', engagement: 'high' },
      ],
      description: 'Morning commute and lunch breaks show peak activity. News consumption highest 8 AM - 12 PM.',
    },
    linkedin: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '17:00', label: '5:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '09:00', label: '9:00 AM', engagement: 'medium' },
        { time: '14:00', label: '2:00 PM', engagement: 'medium' },
      ],
      description: 'B2B content thrives during business hours. Tuesday-Thursday mornings show highest professional engagement.',
    },
    tiktok: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'high' },
        { time: '20:00', label: '8:00 PM', engagement: 'peak' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'peak' },
      ],
      description: 'Evening content dominates in Europe. 8-10 PM is prime viral time. Weekend afternoons highly active.',
    },
    youtube: {
      weekday: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '16:00', label: '4:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'peak' },
      ],
      description: 'Long-form content best in afternoon and evening. Weekend mornings see high engagement from relaxed viewers.',
    },
  },
  north_america: {
    facebook: {
      weekday: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '15:00', label: '3:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '16:00', label: '4:00 PM', engagement: 'high' },
      ],
      description: 'Mid-day breaks and early afternoon show peak activity. Lunch hour (12-2 PM) is optimal for engagement.',
    },
    instagram: {
      weekday: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'peak' },
      ],
      description: 'Visual storytelling peaks at lunch and after work. Weekend brunch hours (10-11 AM) perform exceptionally well.',
    },
    twitter: {
      weekday: [
        { time: '08:00', label: '8:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '17:00', label: '5:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '16:00', label: '4:00 PM', engagement: 'high' },
      ],
      description: 'Morning commute (7-9 AM) and lunch breaks drive engagement. Breaking news performs best 8 AM - 12 PM.',
    },
    linkedin: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '17:00', label: '5:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'medium' },
        { time: '14:00', label: '2:00 PM', engagement: 'medium' },
      ],
      description: 'Early birds and lunch scrollers dominate. Professional content peaks Tuesday-Thursday, 7-9 AM.',
    },
    tiktok: {
      weekday: [
        { time: '06:00', label: '6:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '19:00', label: '7:00 PM', engagement: 'peak' },
      ],
      weekend: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'peak' },
      ],
      description: 'Early morning scrollers and evening viewers drive virality. Peak hours: 6-8 PM weekdays, 2-4 PM weekends.',
    },
    youtube: {
      weekday: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'peak' },
      ],
      description: 'Afternoon snacking and evening wind-down hours optimal. Weekend mornings ideal for educational content.',
    },
  },
  latin_america: {
    facebook: {
      weekday: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      description: 'Later schedules mean peak engagement shifts to afternoon and evening. Dinner time (8-9 PM) shows high activity.',
    },
    instagram: {
      weekday: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '16:00', label: '4:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'peak' },
      ],
      description: 'Visual content thrives mid-afternoon and evening. Weekend engagement peaks later (4-9 PM).',
    },
    twitter: {
      weekday: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '18:00', label: '6:00 PM', engagement: 'high' },
      ],
      description: 'News and trending topics peak mid-day and early evening. Strong social media culture drives high engagement.',
    },
    linkedin: {
      weekday: [
        { time: '08:00', label: '8:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '18:00', label: '6:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'medium' },
        { time: '15:00', label: '3:00 PM', engagement: 'medium' },
      ],
      description: 'Professional networking peaks during extended lunch breaks. Business content performs well 1-3 PM.',
    },
    tiktok: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'high' },
        { time: '21:00', label: '9:00 PM', engagement: 'peak' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '16:00', label: '4:00 PM', engagement: 'peak' },
        { time: '22:00', label: '10:00 PM', engagement: 'peak' },
      ],
      description: 'Evening hours (8-11 PM) dominate for viral content. Young demographic drives late-night engagement.',
    },
    youtube: {
      weekday: [
        { time: '13:00', label: '1:00 PM', engagement: 'high' },
        { time: '17:00', label: '5:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '16:00', label: '4:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'peak' },
      ],
      description: 'Afternoon and prime evening hours best for long-form content. Family viewing time (7-9 PM) performs well.',
    },
  },
  asia: {
    facebook: {
      weekday: [
        { time: '08:00', label: '8:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'high' },
      ],
      description: 'Early morning and evening engagement strong. Lunch hour shows peak activity across Asian markets.',
    },
    instagram: {
      weekday: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'peak' },
      ],
      description: 'Visual content peaks during lunch breaks and late evening. Mobile-first culture drives high engagement.',
    },
    twitter: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '18:00', label: '6:00 PM', engagement: 'high' },
      ],
      description: 'Commute hours and lunch breaks drive engagement. Tech and business news peak 7-9 AM.',
    },
    linkedin: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '18:00', label: '6:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '09:00', label: '9:00 AM', engagement: 'medium' },
        { time: '14:00', label: '2:00 PM', engagement: 'medium' },
      ],
      description: 'Professional networking strongest early morning and lunch. Work ethic drives weekend professional engagement.',
    },
    tiktok: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '21:00', label: '9:00 PM', engagement: 'peak' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '22:00', label: '10:00 PM', engagement: 'peak' },
      ],
      description: 'Late evening (9-11 PM) dominates for viral content. Young, mobile-native audience highly active.',
    },
    youtube: {
      weekday: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '17:00', label: '5:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'peak' },
      ],
      description: 'Evening viewing hours (7-10 PM) optimal. Educational and entertainment content performs exceptionally well.',
    },
  },
  middle_east: {
    facebook: {
      weekday: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '22:00', label: '10:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '16:00', label: '4:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'high' },
      ],
      description: 'Later schedules with peak evening engagement. Post-iftar hours (Ramadan) show exceptional activity.',
    },
    instagram: {
      weekday: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '13:00', label: '1:00 PM', engagement: 'high' },
        { time: '17:00', label: '5:00 PM', engagement: 'peak' },
        { time: '22:00', label: '10:00 PM', engagement: 'peak' },
      ],
      description: 'Afternoon and late evening optimal. High smartphone penetration drives strong mobile engagement.',
    },
    twitter: {
      weekday: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'high' },
      ],
      description: 'News and discussion peak afternoon and evening. Political and cultural content highly engaging.',
    },
    linkedin: {
      weekday: [
        { time: '08:00', label: '8:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '17:00', label: '5:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'medium' },
        { time: '15:00', label: '3:00 PM', engagement: 'medium' },
      ],
      description: 'Business networking peaks mid-day. Growing professional network drives increasing engagement.',
    },
    tiktok: {
      weekday: [
        { time: '08:00', label: '8:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'high' },
        { time: '22:00', label: '10:00 PM', engagement: 'peak' },
      ],
      weekend: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '17:00', label: '5:00 PM', engagement: 'peak' },
        { time: '23:00', label: '11:00 PM', engagement: 'peak' },
      ],
      description: 'Late evening (10 PM - 1 AM) drives viral content. Young, digitally-native population highly active.',
    },
    youtube: {
      weekday: [
        { time: '13:00', label: '1:00 PM', engagement: 'high' },
        { time: '17:00', label: '5:00 PM', engagement: 'peak' },
        { time: '22:00', label: '10:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '13:00', label: '1:00 PM', engagement: 'high' },
        { time: '17:00', label: '5:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'peak' },
      ],
      description: 'Prime evening hours (7-11 PM) optimal for long-form content. Family viewing time shows strong engagement.',
    },
  },
  africa: {
    facebook: {
      weekday: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'high' },
      ],
      description: 'Mobile-first engagement with peaks at lunch and evening. Growing internet access drives increasing activity.',
    },
    instagram: {
      weekday: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'peak' },
      ],
      description: 'Visual storytelling peaks afternoon and evening. Youth-driven platform with strong weekend engagement.',
    },
    twitter: {
      weekday: [
        { time: '08:00', label: '8:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '18:00', label: '6:00 PM', engagement: 'high' },
      ],
      description: 'News and social discourse peak morning and midday. Political and social content highly engaging.',
    },
    linkedin: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '17:00', label: '5:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '09:00', label: '9:00 AM', engagement: 'medium' },
        { time: '14:00', label: '2:00 PM', engagement: 'medium' },
      ],
      description: 'Professional networking grows rapidly. Business hours show peak engagement with strong entrepreneurial focus.',
    },
    tiktok: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'high' },
        { time: '20:00', label: '8:00 PM', engagement: 'peak' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'peak' },
      ],
      description: 'Rapidly growing platform with evening peak engagement. Youth demographic drives viral content creation.',
    },
    youtube: {
      weekday: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '16:00', label: '4:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'peak' },
      ],
      description: 'Afternoon and evening optimal for video content. Educational and entertainment content perform well.',
    },
  },
  oceania: {
    facebook: {
      weekday: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '13:00', label: '1:00 PM', engagement: 'peak' },
        { time: '18:00', label: '6:00 PM', engagement: 'high' },
      ],
      description: 'Morning coffee scrollers and lunch break peaks. Work-life balance culture shows strong evening engagement.',
    },
    instagram: {
      weekday: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '11:00', label: '11:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'peak' },
      ],
      description: 'Outdoor and lifestyle content peaks midday and evening. Beach and adventure content performs exceptionally.',
    },
    twitter: {
      weekday: [
        { time: '08:00', label: '8:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '17:00', label: '5:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '09:00', label: '9:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '16:00', label: '4:00 PM', engagement: 'high' },
      ],
      description: 'Morning news consumption and lunch breaks drive peak activity. Sports content highly engaging.',
    },
    linkedin: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'peak' },
        { time: '17:00', label: '5:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '09:00', label: '9:00 AM', engagement: 'medium' },
        { time: '14:00', label: '2:00 PM', engagement: 'medium' },
      ],
      description: 'Professional networking peaks business hours. Tuesday-Thursday mornings show highest engagement.',
    },
    tiktok: {
      weekday: [
        { time: '07:00', label: '7:00 AM', engagement: 'high' },
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '20:00', label: '8:00 PM', engagement: 'peak' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '21:00', label: '9:00 PM', engagement: 'peak' },
      ],
      description: 'Evening content (7-10 PM) drives virality. Lifestyle and humor content performs exceptionally well.',
    },
    youtube: {
      weekday: [
        { time: '12:00', label: '12:00 PM', engagement: 'high' },
        { time: '15:00', label: '3:00 PM', engagement: 'peak' },
        { time: '20:00', label: '8:00 PM', engagement: 'high' },
      ],
      weekend: [
        { time: '10:00', label: '10:00 AM', engagement: 'high' },
        { time: '14:00', label: '2:00 PM', engagement: 'peak' },
        { time: '19:00', label: '7:00 PM', engagement: 'peak' },
      ],
      description: 'Afternoon and prime evening hours optimal. Tutorial and entertainment content perform strongly.',
    },
  },
};

// Helper function to get posting times based on selected country's region
export function getBestPostingTimes(region = 'europe') {
  return bestPostingTimesByRegion[region] || bestPostingTimesByRegion.europe;
}

// Helper function to convert weekday/weekend data into day-by-day structure
export function getDayByDayPostingTimes(region = 'europe', platform = 'facebook') {
  const regionData = getBestPostingTimes(region);
  const platformData = regionData[platform];

  if (!platformData) return null;

  const { weekday, weekend } = platformData;

  // Region-specific best/worst days based on cultural patterns and engagement data
  const regionEngagementPatterns = {
    europe: {
      bestDays: ['Wednesday', 'Thursday'],
      worstDay: 'Sunday',
      reason: 'Mid-week engagement peaks due to work-life balance culture. Sunday is family/rest day.',
    },
    north_america: {
      bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
      worstDay: 'Saturday',
      reason: 'Mid-week shows consistent engagement. Saturday often offline for activities.',
    },
    latin_america: {
      bestDays: ['Tuesday', 'Wednesday'],
      worstDay: 'Sunday',
      reason: 'Mid-week engagement strong. Sunday is traditional family and church day.',
    },
    asia: {
      bestDays: ['Wednesday', 'Thursday'],
      worstDay: 'Sunday',
      reason: 'Mid-week peaks with strong work ethic. Sunday lower engagement despite 6-day work weeks in some areas.',
    },
    middle_east: {
      bestDays: ['Sunday', 'Monday', 'Tuesday'],
      worstDay: 'Friday',
      reason: 'Work week starts Sunday in many Middle Eastern countries. Friday is Islamic holy day with minimal engagement.',
    },
    africa: {
      bestDays: ['Wednesday', 'Thursday'],
      worstDay: 'Sunday',
      reason: 'Mid-week engagement strongest. Sunday is rest/worship day across diverse cultures.',
    },
    oceania: {
      bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
      worstDay: 'Sunday',
      reason: 'Strong mid-week engagement with outdoor lifestyle culture. Sunday reserved for leisure activities.',
    },
  };

  const pattern = regionEngagementPatterns[region] || regionEngagementPatterns.europe;

  // Create varied time combinations for each day based on weekday/weekend data
  // Weekdays get variations of weekday times, weekends get weekend times
  return {
    monday: weekday.length >= 3 ? [weekday[0], weekday[1], weekday[2]] : weekday,
    tuesday: weekday.length >= 3 ? [weekday[0], weekday[1], weekday[2]] : weekday,
    wednesday: weekday.length >= 3 ? [weekday[0], weekday[1], weekday[2]] : weekday,
    thursday: weekday.length >= 3 ? [weekday[0], weekday[1], weekday[2]] : weekday,
    friday: weekday.length >= 2 ? [weekday[0], ...weekend.slice(0, 2)] : weekday,
    saturday: weekend,
    sunday: weekend.slice(0, Math.max(2, weekend.length - 1)), // Sunday typically has fewer optimal times
    bestDays: pattern.bestDays,
    worstDay: pattern.worstDay,
    description: platformData.description,
  };
}

export const platformInfo = {
  facebook: { name: 'Facebook', color: '#1877F2', icon: 'facebook' },
  instagram: { name: 'Instagram', color: '#E4405F', icon: 'instagram' },
  twitter: { name: 'Twitter/X', color: '#1DA1F2', icon: 'twitter' },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', icon: 'linkedin' },
  tiktok: { name: 'TikTok', color: '#000000', icon: 'video' },
  youtube: { name: 'YouTube', color: '#FF0000', icon: 'youtube' },
};
