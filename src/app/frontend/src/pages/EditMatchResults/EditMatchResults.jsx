import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import s from "./style.module.css";
import MatchRecordModal from "../../components/MatchRecordModal/MatchRecordModal";
import { useSelector } from "react-redux";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function EditMatchResults() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const rules = useSelector((store) => store.rulesSlice.rules);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/match-results/`);
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const matchResults = await response.json();
      
      // Fetch additional match details for each result
      const matchesWithDetails = await Promise.all(
        matchResults.map(async (result) => {
          try {
            const matchResponse = await fetch(`${API_BASE}/api/matches/${result.match}/`);
            if (!matchResponse.ok) {
              throw new Error('Failed to fetch match details');
            }
            const matchDetails = await matchResponse.json();
            
            // Combine the data
            return {
              ...matchDetails,
              update_id: result.id,
              home_score: result.home_score,
              away_score: result.away_score,
              goals: result.goals
            };
          } catch (error) {
            console.error('Error fetching match details:', error);
            return result;
          }
        })
      );

      setMatches(matchesWithDetails);
      console.log(matchesWithDetails);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách trận đấu!');
    }
  };

  const filteredMatches = matches.filter(match => {
    const searchLower = searchQuery.toLowerCase();
    const matchDate = new Date(match.match_date).toISOString().split('T')[0];

    return (
      (match.home_team_name.toLowerCase().includes(searchLower) ||
       match.away_team_name.toLowerCase().includes(searchLower)) &&
      (!dateFilter || matchDate === dateFilter)
    );
  });

  const handleEditMatch = async (match) => {
    setSelectedMatch(match);
  };

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kết quả trận đấu này?')) {
      try {
        const response = await fetch(`${API_BASE}/api/match-results/delete/${matchId}/`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete match result');
        }

        toast.success('Xóa kết quả trận đấu thành công!');
        fetchMatches();
      } catch (error) {
        console.error('Error deleting match result:', error);
        toast.error('Có lỗi xảy ra khi xóa kết quả trận đấu!');
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedMatch(null);
  };

  const handleSaveMatchRecord = async (matchData) => {
    try {
      const response = await fetch(`${API_BASE}/api/match-results/${selectedMatch.update_id}/update-result/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        throw new Error('Failed to update match result');
      }

      toast.success('Cập nhật kết quả trận đấu thành công!');
      setSelectedMatch(null);
      fetchMatches();
    } catch (error) {
      console.error('Error updating match result:', error);
      toast.error('Có lỗi xảy ra khi cập nhật kết quả trận đấu!');
    }
  };

  return (
    <div className={s.container}>
      <div className={s.search_section}>
        <div className={s.search_box}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đội..."
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
        </div>
      </div>

      <div className={s.table_container}>
        <div className={s.table_wrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Đội nhà</th>
                <th>Tỷ số</th>
                <th>Đội khách</th>
                <th>Sân</th>
                <th>Ngày</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match) => (
                <tr key={match.id}>
                  <td>{match.home_team_name}</td>
                  <td>{`${match.home_score} - ${match.away_score}`}</td>
                  <td>{match.away_team_name}</td>
                  <td>{match.stadium}</td>
                  <td>{new Date(match.match_date).toLocaleDateString('vi-VN')}</td>
                  <td className={s.action_buttons}>
                    <button 
                      onClick={() => handleEditMatch(match)} 
                      className={s.icon_button} 
                      title="Chỉnh sửa"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={s.edit_icon_svg} viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteMatch(match.id)} 
                      className={s.icon_button} 
                      title="Xóa"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={s.delete_icon_svg} viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
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
          isEditing={true}
          rules={rules}
        />
      )}
    </div>
  );
} 