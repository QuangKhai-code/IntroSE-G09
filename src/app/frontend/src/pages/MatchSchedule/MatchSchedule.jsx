import React, { useState, useEffect } from 'react';
import s from './style.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import PastMatches from '../../components/PastMatches/PastMatches';
import UpcomingMatches from '../../components/UpcomingMatches/UpcomingMatches';
import { getTeamLogo } from '../../utils/teamMappings';

export default function MatchSchedule() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://127.0.0.1:8000/api/matches/upcoming/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate API response structure
        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Invalid API response format');
        }

        // Transform the API data to match our component's structure
        const transformedMatches = data.results.map(match => ({
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
          time: match.match_time.split(':').slice(0, 2).join(':'), // Convert "HH:MM:SS" to "HH:MM"
          stadium: match.stadium,
          round: 'Sắp diễn ra' // Since the API doesn't provide round info, we'll use a default value
        }));

        setMatches(transformedMatches);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err.message || 'Failed to fetch matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className={s.schedulePage}>
      <Header />
      <h1 className={s.title}>LỊCH THI ĐẤU</h1>
      <PastMatches />
      <UpcomingMatches matches={matches} loading={loading} error={error} />
      <section>
        <Footer />
      </section>
    </div>
  );
}