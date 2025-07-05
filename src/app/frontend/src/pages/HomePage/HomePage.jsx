import React, { useState, useEffect, useCallback } from "react";
import s from "./style.module.css";
import Banner from "../../components/Banner/Banner";
import Footer from "../../components/Footer/Footer";
import LeagueStandings from "../../components/LeagueStandings/LeagueStandings";

// Cache key for storing standings data
const CACHE_KEY = 'league_standings_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function HomePage() {
  const [standings, setStandings] = useState([]);
  const [reportDate, setReportDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform standings data
  const transformStandings = useCallback((data) => {
    return data.standings.map((team, index) => ({
      stt: index + 1,
      name: team.team_name,
      won: team.won,
      drawn: team.drawn,
      lost: team.lost,
      goalDifference: team.goal_difference,
      points: team.points,
      rank: index + 1
    }));
  }, []);

  // Check if cache is valid
  const isCacheValid = (cacheData) => {
    if (!cacheData || !cacheData.timestamp) return false;
    return Date.now() - cacheData.timestamp < CACHE_DURATION;
  };

  // Fetch standings data
  const fetchStandings = useCallback(async () => {
    try {
      // Check cache first
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        if (isCacheValid(parsedCache)) {
          setStandings(parsedCache.data);
          setReportDate(parsedCache.reportDate);
          setLoading(false);
          return;
        }
      }

      // If no valid cache, fetch from API
      const response = await fetch('http://127.0.0.1:8000/api/league-standings/');
      if (!response.ok) {
        throw new Error('Failed to fetch standings');
      }
      const data = await response.json();
      
      // Transform and cache the data
      const transformedData = transformStandings(data);
      const cacheData = {
        data: transformedData,
        reportDate: data.report_date,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setStandings(transformedData);
      setReportDate(data.report_date);
    } catch (err) {
      setError(err.message);
      // If there's an error but we have cached data, use it
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        setStandings(parsedCache.data);
        setReportDate(parsedCache.reportDate);
      }
    } finally {
      setLoading(false);
    }
  }, [transformStandings]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  // Loading component
  const LoadingComponent = () => (
    <div className={s.loadingContainer}>
      <div className={s.loadingSpinner}></div>
      <p>Đang tải dữ liệu...</p>
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div className={s.errorContainer}>
      <p>Lỗi: {error}</p>
      <button onClick={fetchStandings} className={s.retryButton}>
        Thử lại
      </button>
    </div>
  );

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
            <LoadingComponent />
          ) : error ? (
            <ErrorComponent />
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