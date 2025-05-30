import React, { useState, useEffect } from 'react';
import s from './style.module.css';

// Hook để theo dõi kích thước màn hình
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

const MATCHES_PER_PAGE = 5;

export default function UpcomingMatches({ matches, loading, error }) {
  const [selectedRound, setSelectedRound] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const { width } = useWindowSize();
  
  // Tính toán số lượng trận đấu mỗi trang dựa trên kích thước màn hình
  const getMatchesPerPage = () => {
    if (width < 768) return 3;      // Mobile
    if (width < 1024) return 4;     // Tablet
    if (width < 1440) return 6;     // Small desktop
    return 8;                       // Large desktop
  };

  const matchesPerPage = getMatchesPerPage();
  const rounds = ['Tất cả', ...Array.from(new Set(matches.map(m => m.round)))];
  const filteredMatches = selectedRound === 'Tất cả' ? matches : matches.filter(m => m.round === selectedRound);
  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);
  const paginatedMatches = filteredMatches.slice((page - 1) * matchesPerPage, page * matchesPerPage);

  if (loading) {
    return (
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Lịch sắp diễn ra</h2>
        <div className={s.loadingContainer}>
          <div className={s.loadingSpinner}></div>
          <p className={s.loadingText}>Đang tải...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Lịch sắp diễn ra</h2>
        <div className={s.errorContainer}>
          <svg className={s.errorIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          <p className={s.errorText}>Lỗi: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={s.section}>
      <h2 className={s.sectionTitle}>Lịch sắp diễn ra</h2>
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
            <div className={s.upcomingDayTitle}>
              <svg className={s.calendarIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {day}
            </div>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C7.03 2 3 6.03 3 11C3 16.25 8.55 21.54 11.1 23.72C11.64 24.18 12.36 24.18 12.9 23.72C15.45 21.54 21 16.25 21 11C21 6.03 16.97 2 12 2ZM12 13.5C10.07 13.5 8.5 11.93 8.5 10C8.5 8.07 10.07 6.5 12 6.5C13.93 6.5 15.5 8.07 15.5 10C15.5 11.93 13.93 13.5 12 13.5Z" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className={s.upcomingStadium}>{match.stadium}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className={s.pagination}>
          <button
            className={`${s.paginationBtn} ${page === 1 ? s.paginationBtnDisabled : ''}`}
            onClick={() => setPage(page > 1 ? page - 1 : 1)}
            disabled={page === 1}
            aria-label="Trang trước"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className={s.paginationText}>{page}/{totalPages}</span>
          <button
            className={`${s.paginationBtn} ${page === totalPages ? s.paginationBtnDisabled : ''}`}
            onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
            disabled={page === totalPages}
            aria-label="Trang sau"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </section>
  );
} 