import React, { useState } from 'react';
import s from './style.module.css';

const MATCHES_PER_PAGE = 5;

export default function UpcomingMatches({ matches, loading, error }) {
  const [selectedRound, setSelectedRound] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const rounds = ['Tất cả', ...Array.from(new Set(matches.map(m => m.round)))];
  const filteredMatches = selectedRound === 'Tất cả' ? matches : matches.filter(m => m.round === selectedRound);
  const totalPages = Math.ceil(filteredMatches.length / MATCHES_PER_PAGE);
  const paginatedMatches = filteredMatches.slice((page - 1) * MATCHES_PER_PAGE, page * MATCHES_PER_PAGE);

  if (loading) {
    return (
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Lịch sắp diễn ra</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Lịch sắp diễn ra</h2>
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Lỗi: {error}</div>
      </section>
    );
  }

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
      {totalPages >= 1 && (
        <div className={s.pagination}>
          <button
            className={s.paginationBtn}
            onClick={() => setPage(page > 1 ? page - 1 : 1)}
            disabled={page === 1}
            aria-label="Trang trước"
          >
            <span style={{ color: page === 1 ? '#ccc' : '#5a206e', fontSize: 24 }}>&lt;</span>
          </button>
          <span className={s.paginationText}>{page}/{totalPages}</span>
          <button
            className={s.paginationBtn}
            onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
            disabled={page === totalPages}
            aria-label="Trang sau"
          >
            <span style={{ color: page === totalPages ? '#ccc' : '#5a206e', fontSize: 24 }}>&gt;</span>
          </button>
        </div>
      )}
    </section>
  );
} 