import React, { useState } from 'react';
import s from './style.module.css';

// Mock data
const pastMatches = [
  {
    id: 1,
    league: 'Ngoại hạng Anh',
    date: '2024-05-03',
    time: '21:00',
    status: 'Kết thúc',
    home: {
      name: 'Leicester',
      logo: '/assets/Leicester-City-FC-logo.png',
      scorers: [
        { name: 'Jamie Vardy', minute: 17 },
        { name: 'Jordan Ayew', minute: 44 }
      ]
    },
    away: {
      name: 'Southampton',
      logo: '/assets/Southampton-FC-logo.png',
      scorers: []
    },
    score: '2 - 0',
    stadium: 'King Power',
  },
  {
    id: 2,
    home: { name: 'Arsenal', logo: '/assets/arsenal.png' },
    away: { name: 'Man City', logo: '/assets/Manchester-City-FC-logo.png' },
    score: '1 - 3',
    date: '2024-04-28',
    stadium: 'Emirates',
  },
  {
    id: 3,
    home: { name: 'Man United', logo: '/assets/Manchester-United-FC-logo.png' },
    away: { name: 'Tottenham', logo: '/assets/Tottenham-Hotspur-logo.png' },
    score: '0 - 0',
    date: '2024-04-25',
    stadium: 'Old Trafford',
  },
  {
    id: 4,
    home: { name: 'Aston Villa', logo: '/assets/aston-villa.png' },
    away: { name: 'Newcastle', logo: '/assets/Newcastle-United-logo.png' },
    score: '2 - 2',
    date: '2024-04-20',
    stadium: 'Villa Park',
  },
  {
    id: 5,
    home: { name: 'Leicester', logo: '/assets/Leicester-City-FC-logo.png' },
    away: { name: 'Southampton', logo: '/assets/Southampton-FC-logo.png' },
    score: '2 - 0',
    date: '2024-05-03',
    stadium: 'King Power',
    status: 'Kết thúc',
    scorers: [
      { name: 'Jamie Vardy', minute: 17, team: 'Leicester' },
      { name: 'Jordan Ayew', minute: 44, team: 'Leicester' }
    ]
  },
  {
    id: 7,
    home: { name: 'Brighton', logo: '/assets/Brighton-Hove-Albion-logo.png' },
    away: { name: 'Crystal Palace', logo: '/assets/Crystal-Palace-FC-logo.png' },
    score: '2 - 4',
    date: '2024-04-10',
    stadium: 'Amex',
  },
];

const MATCHES_PER_PAGE = 5;

export default function PastMatches() {
  const [page, setPage] = useState(1);
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const totalPages = Math.ceil(pastMatches.length / MATCHES_PER_PAGE);
  const paginatedMatches = pastMatches.slice((page - 1) * MATCHES_PER_PAGE, page * MATCHES_PER_PAGE);

  return (
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Lịch sử đấu</h2>
      <div className={s.pastMatchList}>
        {paginatedMatches.map(match => (
          <React.Fragment key={match.id}>
            <div
              className={s.pastMatchRow}
              onClick={() => setExpandedMatchId(expandedMatchId === match.id ? null : match.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={s.pastHomeTeamBlock}>
                <span className={s.pastTeamName}>{match.home.name}</span>
                <img src={match.home.logo} alt={match.home.name} className={s.pastTeamLogo} />
              </div>
              <div className={s.pastScoreBlock}>
                <span className={s.pastScore}>{match.score}</span>
              </div>
              <div className={s.pastAwayTeamBlock}>
                <img src={match.away.logo} alt={match.away.name} className={s.pastTeamLogo} />
                <span className={s.pastTeamName}>{match.away.name}</span>
              </div>
              <div className={s.pastStadiumBlock}>
                <span className={s.pastStadiumIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="4" fill="#5a206e" fillOpacity="0.12"/><rect x="3" y="8" width="18" height="14" rx="2" fill="#5a206e" fillOpacity="0.18"/><rect x="7" y="2" width="2" height="4" rx="1" fill="#5a206e"/><rect x="15" y="2" width="2" height="4" rx="1" fill="#5a206e"/><rect x="3" y="8" width="18" height="1.5" fill="#5a206e"/><rect x="7" y="12" width="2" height="2" rx="1" fill="#5a206e"/><rect x="11" y="12" width="2" height="2" rx="1" fill="#5a206e"/><rect x="15" y="12" width="2" height="2" rx="1" fill="#5a206e"/></svg>
                </span>
                <span className={s.pastStadium}>
                  {new Date(match.date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            {expandedMatchId === match.id && (
              <div className={s.matchDetailRow}>
                <div className={s.matchDetailTop}>
                  <span className={s.matchDetailLeague}>{match.league}</span>
                  <span className={s.matchDetailDate}>
                    · {new Date(match.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                  </span>
                  <span className={s.matchDetailStatus}>{match.status}</span>
                </div>
                <div className={s.matchDetailMain}>
                  <div className={s.matchDetailTeamCol}>
                    <img src={match.home.logo} alt={match.home.name} className={s.matchDetailLogo} />
                    <div className={s.matchDetailTeamName}>{match.home.name}</div>
                  </div>
                  <div className={s.matchDetailScoreCol}>
                    <span className={s.matchDetailScoreHome}>{match.score.split('-')[0].trim()}</span>
                    <span className={s.matchDetailScoreDash}>-</span>
                    <span className={s.matchDetailScoreAway}>{match.score.split('-')[1].trim()}</span>
                  </div>
                  <div className={s.matchDetailTeamCol}>
                    <img src={match.away.logo} alt={match.away.name} className={s.matchDetailLogo} />
                    <div className={s.matchDetailTeamName}>{match.away.name}</div>
                  </div>
                </div>
                <div className={s.matchDetailBottom}>
                  <div className={s.matchDetailScorersLeft}>
                    {match.home.scorers && match.home.scorers.map((s, i) => (
                      <div key={i} className={s.matchDetailScorer}>
                        {s.name} <span className={s.matchDetailScorerMinute}>{s.minute}'</span>
                      </div>
                    ))}
                  </div>
                  <div className={s.matchDetailBallIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.5" fill="#23232b"/><circle cx="12" cy="12" r="2.5" fill="#fff"/><path d="M12 2v7.5M12 21.5v-7.5M2 12h7.5M21.5 12h-7.5M5.5 5.5l5.3 5.3M18.5 18.5l-5.3-5.3M18.5 5.5l-5.3 5.3M5.5 18.5l5.3-5.3" stroke="#fff" strokeWidth="1.2"/></svg>
                  </div>
                  <div className={s.matchDetailScorersRight}>
                    {match.away.scorers && match.away.scorers.map((s, i) => (
                      <div key={i} className={s.matchDetailScorer}>
                        {s.name} <span className={s.matchDetailScorerMinute}>{s.minute}'</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {totalPages > 1 && (
        <div className={s.pagination}>
          <button
            className={s.paginationBtn}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            aria-label="Trang trước"
          >
            <span style={{ color: page === 1 ? '#ccc' : '#5a206e', fontSize: 24 }}>&lt;</span>
          </button>
          <span className={s.paginationText}>{page}/{totalPages}</span>
          <button
            className={s.paginationBtn}
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Trang sau"
          >
            <span style={{ color: page === totalPages ? '#ccc' : '#5a206e', fontSize: 24 }}>&gt;</span>
          </button>
        </div>
      )}
    </div>
  );
} 