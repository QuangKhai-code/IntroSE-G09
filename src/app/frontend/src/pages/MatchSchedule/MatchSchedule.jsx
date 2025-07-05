import React, { useState, useEffect } from 'react';
import s from './style.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import PastMatches from '../../components/PastMatches/PastMatches';
import UpcomingMatches from '../../components/UpcomingMatches/UpcomingMatches';
import { getTeamLogo } from '../../utils/teamMappings';

export default function MatchSchedule() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [pastMatches, setPastMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const upcomingResponse = await fetch('http://127.0.0.1:8000/api/matches/upcoming/');
        if (!upcomingResponse.ok) {
          throw new Error(`HTTP error! status: ${upcomingResponse.status}`);
        }
        const upcomingData = await upcomingResponse.json();
        if (!upcomingData.results || !Array.isArray(upcomingData.results)) {
          throw new Error('Invalid API response format for upcoming matches');
        }
        const transformedUpcoming = upcomingData.results.map(match => ({
          id: match.id,
          home: { 
            name: match.home_team_name,
            logo: getTeamLogo(match.home_team_name)
          },
          away: { 
            name: match.away_team_name,
            logo: getTeamLogo(match.away_team_name)
          },
          date: match.match_date,
          time: match.match_time.split(':').slice(0, 2).join(':'),
          stadium: match.stadium,
          round: 'Sắp diễn ra'
        }));
        setUpcomingMatches(transformedUpcoming);

        const pastResponse = await fetch('http://127.0.0.1:8000/api/match-results/');
        if (!pastResponse.ok) {
          throw new Error('Failed to fetch past matches');
        }
        const pastData = await pastResponse.json();
        setPastMatches(pastData);

      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err.message || 'Failed to fetch matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllMatches();
  }, []);

  return (
    <div className={s.schedulePage}>
      <Header />
      <h1 className={s.title}>LỊCH THI ĐẤU</h1>
      
      <div className={s.tabsContainer}>
        <button
          className={`${s.tabButton} ${activeTab === 'upcoming' ? s.activeTab : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Lịch sắp diễn ra
        </button>
        <button
          className={`${s.tabButton} ${activeTab === 'past' ? s.activeTab : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Lịch sử đấu
        </button>
      </div>

      <main className={s.mainContent}>
        {activeTab === 'upcoming' ? (
          <UpcomingMatches matches={upcomingMatches} loading={loading} error={error} />
        ) : (
          <PastMatches matches={pastMatches} loading={loading} error={error} />
        )}
      </main>
      
      <Footer />
    </div>
  );
}