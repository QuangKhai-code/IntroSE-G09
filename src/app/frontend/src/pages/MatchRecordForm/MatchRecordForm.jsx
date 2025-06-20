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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={s.edit_icon_svg} xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM12 18C11.4477 18 11 17.5523 11 17V13H7C6.44772 13 6 12.5523 6 12C6 11.4477 6.44772 11 7 11H11V7C11 6.44772 11.4477 6 12 6C12.5523 6 13 6.44772 13 7V11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H13V17C13 17.5523 12.5523 18 12 18Z" fill="#222222"/>
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
