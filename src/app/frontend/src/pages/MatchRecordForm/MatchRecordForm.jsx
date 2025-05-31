import React, { useState, useEffect } from "react";
import s from "./style.module.css";
import { toast } from "react-toastify";
import MatchRecordModal from "../../components/MatchRecordModal/MatchRecordModal";
import { useSelector } from "react-redux";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function MatchRecordForm() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const rules = useSelector((store) => store.rulesSlice.rules);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/matches/upcoming/`);
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      setMatches(data.results);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách trận đấu!');
    }
  };

  const filteredMatches = matches.filter(match => {
    const searchLower = searchQuery.toLowerCase();
    const matchDate = new Date(match.match_date).toISOString().split('T')[0];
    const matchTime = match.match_time.split(':')[0] + ':' + match.match_time.split(':')[1];

    return (
      (match.home_team_name.toLowerCase().includes(searchLower) ||
       match.away_team_name.toLowerCase().includes(searchLower) ||
       match.stadium.toLowerCase().includes(searchLower)) &&
      (!dateFilter || matchDate === dateFilter) &&
      (!timeFilter || matchTime === timeFilter)
    );
  });

  const handleRecordMatch = async (match) => {
    try {
      const response = await fetch(`${API_BASE}/api/matches/${match.id}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch match details');
      }
      const matchDetails = await response.json();
      setSelectedMatch(matchDetails);
    } catch (error) {
      console.error('Error fetching match details:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin trận đấu!');
    }
  };

  const handleCloseModal = () => {
    setSelectedMatch(null);
  };

  const handleSaveMatchRecord = async (matchData) => {
    try {
      const response = await fetch(`${API_BASE}/api/match-results/record/${selectedMatch.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        throw new Error('Failed to record match result');
      }

      toast.success('Ghi nhận kết quả trận đấu thành công!');
      setSelectedMatch(null);
      fetchMatches();
    } catch (error) {
      console.error('Error recording match result:', error);
      toast.error('Có lỗi xảy ra khi ghi nhận kết quả trận đấu!');
    }
  };

  return (
    <div className={s.container}>
      <div className={s.search_section}>
        <div className={s.search_box}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đội hoặc sân..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={s.filter_box}>
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

      <div className={s.table_container}>
        <div className={s.table_wrapper}>
          <table className={s.table}>

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
              {filteredMatches.map((match) => (
                <tr key={match.id}>
                  <td>{match.home_team_name}</td>
                  <td>{match.away_team_name}</td>
                  <td>{match.stadium}</td>
                  <td>{new Date(match.match_date).toLocaleDateString('vi-VN')}</td>
                  <td>{match.match_time}</td>
                  <td className={s.action_buttons}>
                    <button 
                      onClick={() => handleRecordMatch(match)} 
                      className={s.icon_button} 
                      title="Ghi nhận kết quả"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={s.edit_icon_svg} viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {selectedMatch && (
        <MatchRecordModal
          match={selectedMatch}
          onSave={handleSaveMatchRecord}
          onClose={handleCloseModal}
          rules={rules}
        />
      )}
    </div>
  );
}
