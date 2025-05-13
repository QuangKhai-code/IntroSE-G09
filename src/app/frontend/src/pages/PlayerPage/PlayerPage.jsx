import React, { useState, useEffect } from "react";
import s from "./style.module.css";
import TopScorers from "../../components/TopScorers/TopScorers";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

export default function PlayerPage() {
  const [topScorers, setTopScorers] = useState([]);
  const [scorersDate, setScorersDate] = useState("");
  const [loadingScorers, setLoadingScorers] = useState(true);
  const [errorScorers, setErrorScorers] = useState(null);

  useEffect(() => {
    const fetchTopScorers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/players/');
        if (!response.ok) throw new Error('Failed to fetch top scorers');
        const data = await response.json();
        setTopScorers(data.results || data);
        setScorersDate(new Date().toLocaleDateString('vi-VN'));
      } catch (err) {
        setErrorScorers(err.message);
      } finally {
        setLoadingScorers(false);
      }
    };

    fetchTopScorers();
  }, []);

  return (
    <div className={s.player_page}>
      <Header />
      <div className={s.container}>
        <h1 className={s.title}>DANH SÁCH CẦU THỦ</h1>
        <hr className={s.line} />
        {loadingScorers ? (
          <div>Loading top scorers...</div>
        ) : errorScorers ? (
          <div>Error: {errorScorers}</div>
        ) : (
          <TopScorers players={topScorers} reportDate={scorersDate} />
        )}
      </div>
      <Footer />
    </div>
  );
} 