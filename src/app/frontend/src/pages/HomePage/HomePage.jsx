import React, { useState, useEffect } from "react";
import s from "./style.module.css";
import Banner from "../../components/Banner/Banner";
import Footer from "../../components/Footer/Footer";
import LeagueStandings from "../../components/LeagueStandings/LeagueStandings";


export default function HomePage() {
  const [standings, setStandings] = useState([]);
  const [reportDate, setReportDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/league-standings/');
        if (!response.ok) {
          throw new Error('Failed to fetch standings');
        }
        const data = await response.json();
        setReportDate(data.report_date);
        const transformedStandings = data.standings.map((team, index) => ({
          stt: index + 1,
          name: team.team_name,
          won: team.won,
          drawn: team.drawn,
          lost: team.lost,
          goalDifference: team.goal_difference,
          rank: index + 1
        }));
        setStandings(transformedStandings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  return (
    <>
      <section id="home">
        <Banner />
      </section>

      <section id="ranking">
        <div className="ranking_container" style={{ height: "auto", padding: "20px" }}>
          <h1 className={s.title}>BẢNG XẾP HẠNG</h1>
          <hr className={s.line} />
          {loading ? (
            <div>Loading standings...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <LeagueStandings teams={standings} reportDate={reportDate} />
          )}
        </div>
      </section>

      <section>
        <Footer />
      </section>
    </>
  );
}