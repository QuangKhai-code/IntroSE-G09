import React, { useState, useEffect } from 'react';
import s from './style.module.css';
import { getTeamLogo } from '../../utils/teamMappings';

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

export default function PastMatches({ matches, loading, error }) {
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const { width } = useWindowSize();

  const getMatchesPerPage = () => {
    if (width < 768) return 3;
    if (width < 1024) return 4;
    if (width < 1440) return 6;
    return 8; // Default for larger screens
  };

  const matchesPerPage = getMatchesPerPage();
  const totalPages = Math.ceil(matches.length / matchesPerPage);
  const paginatedMatches = matches.slice((page - 1) * matchesPerPage, page * matchesPerPage);

  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageJump = (e) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(pageInput, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        setPage(pageNum);
      } else {
        setPageInput(page.toString());
      }
    }
  };

  if (loading) {
    return (
      <div className={s.section}>
        <h2 className={s.sectionTitle}>Lịch sử đấu</h2>
        <div className={s.loadingContainer}>
          <div className={s.loadingSpinner}></div>
          <p className={s.loadingText}>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.section}>
        <h2 className={s.sectionTitle}>Lịch sử đấu</h2>
        <div className={s.errorContainer}>
          <p className={s.errorText}>Lỗi: {error}</p>
        </div>
      </div>
    );
  }

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
                <span className={s.pastTeamName}>{match.home_team}</span>
                <img src={getTeamLogo(match.home_team)} alt={match.home_team} className={s.pastTeamLogo} />
              </div>
              <div className={s.pastScoreBlock}>
                <span className={s.pastScore}>{`${match.home_score} - ${match.away_score}`}</span>
              </div>
              <div className={s.pastAwayTeamBlock}>
                <img src={getTeamLogo(match.away_team)} alt={match.away_team} className={s.pastTeamLogo} />
                <span className={s.pastTeamName}>{match.away_team}</span>
              </div>
              <div className={s.pastStadiumBlock}>
                <span className={s.pastStadiumIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="4" fill="#5a206e" fillOpacity="0.12"/><rect x="3" y="8" width="18" height="14" rx="2" fill="#5a206e" fillOpacity="0.18"/><rect x="7" y="2" width="2" height="4" rx="1" fill="#5a206e"/><rect x="15" y="2" width="2" height="4" rx="1" fill="#5a206e"/><rect x="3" y="8" width="18" height="1.5" fill="#5a206e"/><rect x="7" y="12" width="2" height="2" rx="1" fill="#5a206e"/><rect x="11" y="12" width="2" height="2" rx="1" fill="#5a206e"/><rect x="15" y="12" width="2" height="2" rx="1" fill="#5a206e"/></svg>
                </span>
                <span className={s.pastStadium}>
                  {new Date(match.match_date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            {expandedMatchId === match.id && (
              <div className={s.matchDetailRow}>
                <div className={s.matchDetailTop}>
                  <span className={s.matchDetailDate}>
                    {new Date(match.match_date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                  </span>
                  <span className={s.matchDetailStatus}>Kết thúc</span>
                </div>
                <div className={s.matchDetailStadium}>
                  <span className={s.matchDetailStadiumIcon}>
                    <svg width="22" height="22" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="128" cy="96" rx="104" ry="40" fill="#FFD700" fillOpacity="0.15"/>
                      <ellipse cx="128" cy="96" rx="88" ry="32" stroke="#FFD700" strokeWidth="8" fill="none"/>
                      <path d="M24 96v48c0 22.09 46.39 40 104 40s104-17.91 104-40V96" stroke="#FFD700" strokeWidth="8" fill="none"/>
                      <ellipse cx="128" cy="96" rx="104" ry="40" stroke="#FFD700" strokeWidth="8" fill="none"/>
                    </svg>
                  </span>
                  <span className={s.matchDetailStadiumName}>{match.stadium}</span>
                </div>
                <div className={s.matchDetailMain}>
                  <div className={s.matchDetailTeamCol}>
                    <img src={getTeamLogo(match.home_team)} alt={match.home_team} className={s.matchDetailLogo} />
                    <div className={s.matchDetailTeamName}>{match.home_team}</div>
                  </div>
                  <div className={s.matchDetailScoreCol}>
                    <span className={s.matchDetailScoreHome}>{match.home_score}</span>
                    <span className={s.matchDetailScoreDash}>-</span>
                    <span className={s.matchDetailScoreAway}>{match.away_score}</span>
                  </div>
                  <div className={s.matchDetailTeamCol}>
                    <img src={getTeamLogo(match.away_team)} alt={match.away_team} className={s.matchDetailLogo} />
                    <div className={s.matchDetailTeamName}>{match.away_team}</div>
                  </div>
                </div>
                <div className={s.matchDetailBottom}>
                  <div className={s.matchDetailScorersLeft}>
                    {match.goals.filter(goal => goal.team_name === match.home_team).map((goal, i) => (
                      <div key={i} className={s.matchDetailScorer}>
                        {goal.player_name} <span className={s.matchDetailScorerMinute}>{goal.minute}'</span>
                      </div>
                    ))}
                  </div>
                  <div className={s.matchDetailBallIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.5" fill="#23232b"/><circle cx="12" cy="12" r="2.5" fill="#fff"/><path d="M12 2v7.5M12 21.5v-7.5M2 12h7.5M21.5 12h-7.5M5.5 5.5l5.3 5.3M18.5 18.5l-5.3-5.3M18.5 5.5l-5.3 5.3M5.5 18.5l5.3-5.3" stroke="#fff" strokeWidth="1.2"/></svg>
                  </div>
                  <div className={s.matchDetailScorersRight}>
                    {match.goals.filter(goal => goal.team_name === match.away_team).map((goal, i) => (
                      <div key={i} className={s.matchDetailScorer}>
                        {goal.player_name} <span className={s.matchDetailScorerMinute}>{goal.minute}'</span>
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
        <div className={s.paginationContainer}>
          <button
            className={s.paginationBtn}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            aria-label="Trang trước"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 15L8 10L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={s.pageInfo}>
            <input
              type="text"
              className={s.pageInput}
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageJump}
            />
            <span className={s.pageTotal}>/ {totalPages || 1}</span>
          </div>
          <button
            className={s.paginationBtn}
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Trang sau"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 5L12 10L7 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
} 