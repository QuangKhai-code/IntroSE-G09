import React, { useState } from 'react';
import s from './style.module.css';

// Mock data
const upcomingMatches = [
  {
    id: 1,
    home: { name: 'Man United', logo: '/assets/Manchester-United-FC-logo.png' },
    away: { name: 'Newcastle', logo: '/assets/Newcastle-United-logo.png' },
    date: '2024-06-10',
    time: '20:00',
    stadium: 'Old Trafford',
    round: 'Vòng 37',
  },
  {
    id: 2,
    home: { name: 'Tottenham', logo: '/assets/Tottenham-Hotspur-logo.png' },
    away: { name: 'Aston Villa', logo: '/assets/aston-villa.png' },
    date: '2024-06-12',
    time: '18:30',
    stadium: 'Tottenham Hotspur Stadium',
    round: 'Vòng 38',
  },
  {
    id: 3,
    home: { name: 'Chelsea', logo: '/assets/Chelsea-FC-logo.png' },
    away: { name: 'Liverpool', logo: '/assets/Liverpool-FC-logo.png' },
    date: '2024-06-15',
    time: '21:00',
    stadium: 'Stamford Bridge',
    round: 'Vòng 38',
  },
  {
    id: 4,
    home: { name: 'Arsenal', logo: '/assets/arsenal.png' },
    away: { name: 'Man City', logo: '/assets/Manchester-City-FC-logo.png' },
    date: '2024-06-18',
    time: '19:00',
    stadium: 'Emirates',
    round: 'Vòng 38',
  },
  {
    id: 5,
    home: { name: 'Leicester', logo: '/assets/Leicester-City-FC-logo.png' },
    away: { name: 'Everton', logo: '/assets/Everton-FC-logo.png' },
    date: '2024-06-20',
    time: '17:30',
    stadium: 'King Power',
    round: 'Vòng 38',
  },
  {
    id: 7,
    home: { name: 'Brighton', logo: '/assets/Brighton-Hove-Albion-logo.png' },
    away: { name: 'Crystal Palace', logo: '/assets/Crystal-Palace-FC-logo.png' },
    date: '2024-06-24',
    time: '15:00',
    stadium: 'Amex',
    round: 'Vòng 39',
  },
  {
    id: 8,
    home: { name: 'Fulham', logo: '/assets/Fulham-FC-logo.png' },
    away: { name: 'Brentford', logo: '/assets/Brentford-FC-logo.png' },
    date: '2024-06-26',
    time: '20:45',
    stadium: 'Craven Cottage',
    round: 'Vòng 39',
  },
  {
    id: 9,
    home: { name: 'Southampton', logo: '/assets/Southampton-FC-logo.png' },
    away: { name: 'Nottingham Forest', logo: '/assets/Nottingham-Forest-FC-logo.png' },
    date: '2024-06-28',
    time: '18:00',
    stadium: 'St Mary\'s',
    round: 'Vòng 39',
  },
  {
    id: 10,
    home: { name: 'Wolves', logo: '/assets/Wolverhampton-Wanderers-logo.png' },
    away: { name: 'Bournemouth', logo: '/assets/AFC-Bournemouth.png' },
    date: '2024-06-30',
    time: '21:15',
    stadium: 'Molineux',
    round: 'Vòng 39',
  },
];

const MATCHES_PER_PAGE = 5;

export default function UpcomingMatches() {
  const [selectedRound, setSelectedRound] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const rounds = ['Tất cả', ...Array.from(new Set(upcomingMatches.map(m => m.round)))];
  const filteredMatches = selectedRound === 'Tất cả' ? upcomingMatches : upcomingMatches.filter(m => m.round === selectedRound);
  const totalPages = Math.ceil(filteredMatches.length / MATCHES_PER_PAGE);
  const paginatedMatches = filteredMatches.slice((page - 1) * MATCHES_PER_PAGE, page * MATCHES_PER_PAGE);

  return (
    <section className={s.section}>
      <h2 className={s.sectionTitle}>Lịch sắp diễn ra</h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="round-select" style={{ fontWeight: 600, marginRight: 8 }}>Chọn vòng:</label>
        <select id="round-select" value={selectedRound} onChange={e => { setSelectedRound(e.target.value); setPage(1); }}>
          {rounds.map(round => (
            <option key={round} value={round}>{round}</option>
          ))}
        </select>
      </div>
      <div className={s.upcomingMatchList}>
        {Object.entries(
          paginatedMatches.reduce((acc, match) => {
            const d = new Date(match.date);
            const dayStr = d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
            if (!acc[dayStr]) acc[dayStr] = [];
            acc[dayStr].push(match);
            return acc;
          }, {})
        ).map(([day, matches]) => (
          <div key={day} className={s.upcomingDayGroup}>
            <div className={s.upcomingDayTitle}>{day}</div>
            {matches.map(match => (
              <div className={s.upcomingMatchRow} key={match.id}>
                <div className={s.upcomingHomeTeamBlock}>
                  <span className={s.upcomingTeamName}>{match.home.name}</span>
                  <img src={match.home.logo} alt={match.home.name} className={s.upcomingTeamLogo} />
                </div>
                <div className={s.upcomingTimeBlock}>
                  <span className={s.upcomingTime}>{match.time}</span>
                </div>
                <div className={s.upcomingAwayTeamBlock}>
                  <img src={match.away.logo} alt={match.away.name} className={s.upcomingTeamLogo} />
                  <span className={s.upcomingTeamName}>{match.away.name}</span>
                </div>
                <div className={s.upcomingStadiumBlock}>
                  <span className={s.upcomingStadiumIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C7.03 2 3 6.03 3 11C3 16.25 8.55 21.54 11.1 23.72C11.64 24.18 12.36 24.18 12.9 23.72C15.45 21.54 21 16.25 21 11C21 6.03 16.97 2 12 2ZM12 13.5C10.07 13.5 8.5 11.93 8.5 10C8.5 8.07 10.07 6.5 12 6.5C13.93 6.5 15.5 8.07 15.5 10C15.5 11.93 13.93 13.5 12 13.5Z" fill="#5a206e"/></svg>
                  </span>
                  <span className={s.upcomingStadium}>{match.stadium}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={s.pagination}>
        <button
          className={s.paginationBtn}
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          aria-label="Trang trước"
        >
          <span style={{ color: '#5a206e', fontSize: 24 }}>&lt;</span>
        </button>
        <span className={s.paginationText}>{page}/{totalPages}</span>
        <button
          className={s.paginationBtn}
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
          aria-label="Trang sau"
        >
          <span style={{ color: '#5a206e', fontSize: 24 }}>&gt;</span>
        </button>
      </div>
    </section>
  );
} 