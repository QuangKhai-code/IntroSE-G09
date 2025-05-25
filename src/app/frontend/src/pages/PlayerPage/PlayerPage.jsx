import React, { useState, useEffect, useCallback } from "react";
import s from "./style.module.css";
import TopScorers from "../../components/TopScorers/TopScorers";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

// Cache configuration
const CACHE_KEY = 'top_scorers_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function PlayerPage() {
  const [topScorers, setTopScorers] = useState([]);
  const [scorersDate, setScorersDate] = useState("");
  const [loadingScorers, setLoadingScorers] = useState(true);
  const [errorScorers, setErrorScorers] = useState(null);

  // Transform scorers data
  const transformScorers = useCallback((data) => {
    return data.results || data;
  }, []);

  // Check if cache is valid
  const isCacheValid = (cacheData) => {
    if (!cacheData || !cacheData.timestamp) return false;
    return Date.now() - cacheData.timestamp < CACHE_DURATION;
  };

  // Fetch top scorers data
  const fetchTopScorers = useCallback(async () => {
    try {
      // Check cache first
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        if (isCacheValid(parsedCache)) {
          setTopScorers(parsedCache.data);
          setScorersDate(parsedCache.reportDate);
          setLoadingScorers(false);
          return;
        }
      }

      // If no valid cache, fetch from API
      const response = await fetch('http://127.0.0.1:8000/api/players/');
      if (!response.ok) throw new Error('Failed to fetch top scorers');
      const data = await response.json();
      
      // Transform and cache the data
      const transformedData = transformScorers(data);
      const cacheData = {
        data: transformedData,
        reportDate: data.report_date || new Date().toLocaleDateString('vi-VN'),
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setTopScorers(transformedData);
      setScorersDate(cacheData.reportDate);
    } catch (err) {
      setErrorScorers(err.message);
      // If there's an error but we have cached data, use it
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        setTopScorers(parsedCache.data);
        setScorersDate(parsedCache.reportDate);
      }
    } finally {
      setLoadingScorers(false);
    }
  }, [transformScorers]);

  useEffect(() => {
    fetchTopScorers();
  }, [fetchTopScorers]);

  // Loading component
  const LoadingComponent = () => (
    <div className={s.loadingContainer}>
      <div className={s.loadingSpinner}></div>
      <p>Đang tải danh sách cầu thủ...</p>
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div className={s.errorContainer}>
      <p>Lỗi: {errorScorers}</p>
      <button onClick={fetchTopScorers} className={s.retryButton}>
        Thử lại
      </button>
    </div>
  );

  return (
    <div className={s.player_page}>
      <Header />
      <div className={s.container}>
        <h1 className={s.title}>DANH SÁCH CẦU THỦ</h1>
        <hr className={s.line} />
        {loadingScorers ? (
          <LoadingComponent />
        ) : errorScorers ? (
          <ErrorComponent />
        ) : (
          <TopScorers players={topScorers} reportDate={scorersDate} />
        )}
      </div>
      <Footer />
    </div>
  );
} 