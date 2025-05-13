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
        const response = await fetch('http://localhost:8000/api/rounds/all_with_matches/');
        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }
        const data = await response.json();
        // Transform the API data to match our component's structure
        const transformedMatches = data.flatMap(round => 
          round.matches.map(match => ({
            id: match.id,
            home: { 
              name: match.home_team.name,
              logo: getTeamLogo(match.home_team.name)
            },
            away: { 
              name: match.away_team.name,
              logo: getTeamLogo(match.away_team.name)
            },
            date: match.date,
            time: match.time,
            stadium: match.stadium,
            round: `Vòng ${round.round_number}`
          }))
        );
        setMatches(transformedMatches);
        setLoading(false);
      } catch (err) {
        setError(err.message);
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