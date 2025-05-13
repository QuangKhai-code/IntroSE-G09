export const teamLogoMappings = {
  'Manchester United': '/assets/Manchester-United-FC-logo.png',
  'Newcastle United': '/assets/Newcastle-United-logo.png',
  'Tottenham Hotspur': '/assets/Tottenham-Hotspur-logo.png',
  'Aston Villa': '/assets/aston-villa.png',
  'Chelsea': '/assets/Chelsea-FC-logo.png',
  'Liverpool': '/assets/Liverpool-FC-logo.png',
  'Arsenal': '/assets/arsenal.png',
  'Manchester City': '/assets/Manchester-City-FC-logo.png',
  'Leicester City': '/assets/Leicester-City-FC-logo.png',
  'Everton': '/assets/Everton-FC-logo.png',
  'Brighton & Hove Albion': '/assets/Brighton-Hove-Albion-logo.png',
  'Crystal Palace': '/assets/Crystal-Palace-FC-logo.png',
  'Fulham': '/assets/Fulham-FC-logo.png',
  'Brentford': '/assets/Brentford-FC-logo.png',
  'Southampton': '/assets/Southampton-FC-logo.png',
  'Nottingham Forest': '/assets/Nottingham-Forest-FC-logo.png',
  'Wolverhampton Wanderers': '/assets/Wolverhampton-Wanderers-logo.png',
  'AFC Bournemouth': '/assets/AFC-Bournemouth.png',
  // Add more teams as needed
};

export const getTeamLogo = (teamName) => {
  return teamLogoMappings[teamName] || '/assets/default-team-logo.png';
}; 