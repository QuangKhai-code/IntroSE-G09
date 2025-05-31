import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styles from "./style.module.css";
import { motion } from "framer-motion";
import EditMatchModal from "../../components/EditMatchModal/EditMatchModal";

const API_BASE = import.meta.env.VITE_API_URL || "";

const EditMatchSchedule = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/matches/upcoming/`);
      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }
      const data = await response.json();
      setMatches(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError(error.message);
      toast.error("Error fetching matches: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (matchId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/matches/${matchId}/`);
      if (!response.ok) {
        throw new Error("Failed to fetch match details");
      }
      const matchData = await response.json();
      setSelectedMatch(matchData);
    } catch (error) {
      console.error("Error fetching match details:", error);
      toast.error("Error fetching match details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (matchId) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/matches/${matchId}/`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete match");
        }
        toast.success("Match deleted successfully");
        fetchMatches();
      } catch (error) {
        console.error("Error deleting match:", error);
        toast.error("Error deleting match: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async (updatedMatch) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/matches/${updatedMatch.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMatch),
      });
      if (!response.ok) {
        throw new Error("Failed to update match");
      }
      toast.success("Match updated successfully");
      setSelectedMatch(null);
      fetchMatches();
    } catch (error) {
      console.error("Error updating match:", error);
      toast.error("Error updating match: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.home_team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.away_team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.stadium.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = dateFilter ? match.match_date === dateFilter : true;
    const matchesTime = timeFilter ? match.match_time === timeFilter : true;

    return matchesSearch && matchesDate && matchesTime;
  });

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error_message}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchMatches} className={styles.retry_button}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={styles.container}
    >
      <div className={styles.search_section}>
        <div className={styles.search_box}>
          <input
            type="text"
            placeholder="Search by team name or stadium..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filter_box}>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <input
            type="time"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.table_container}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div className={styles.table_wrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Đội nhà</th>
                  <th>Đội khách</th>
                  <th>Sân vận động</th>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.no_matches}>
                      No matches found
                    </td>
                  </tr>
                ) : (
                  filteredMatches.map((match) => (
                    <tr key={match.id}>
                      <td>{match.home_team_name}</td>
                      <td>{match.away_team_name}</td>
                      <td>{match.stadium}</td>
                      <td>{new Date(match.match_date).toLocaleDateString('vi-VN')}</td>
                      <td>{match.match_time.split(':').slice(0, 2).join(':')}</td>
                      <td className={styles.action_buttons}>
                        <button
                          className={styles.icon_button}
                          onClick={() => handleEdit(match.id)}
                          disabled={loading}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            className={styles.edit_icon_svg}
                            viewBox="0 0 16 16"
                          >
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                          </svg>
                        </button>
                        <button
                          className={styles.icon_button}
                          onClick={() => handleDelete(match.id)}
                          disabled={loading}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            className={styles.delete_icon_svg}
                            viewBox="0 0 16 16"
                          >
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                            <path
                              fillRule="evenodd"
                              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMatch && (
        <EditMatchModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSave={handleSave}
        />
      )}
    </motion.div>
  );
};

export default EditMatchSchedule; 