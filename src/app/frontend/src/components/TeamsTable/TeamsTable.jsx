import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import s from './style.module.css';
import TeamModal from '../TeamModal/TeamModal';

export default function TeamsTable({ teams, onDelete, onUpdate}) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const teamsPerPage = 10;

  // Pagination logic
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = teams.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(teams.length / teamsPerPage);

  const handleEdit = (team) => {
    setSelectedTeam(team);
  };

  const handleCloseModal = () => {
    setSelectedTeam(null);
  };

  const handleSave = (updatedTeam) => {
    onUpdate(updatedTeam);
    setSelectedTeam(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={s.table_container}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Tên đội</th>
            <th>Sân nhà</th>
            <th>Số lượng cầu thủ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentTeams.map((team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.homeStadium}</td>
              <td>{team.players?.length || 0}</td>
              <td className={s.action_buttons}>
                <button onClick={() => handleEdit(team)} className={s.icon_button} title="Chỉnh sửa">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={s.edit_icon_svg} viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                  </svg>
                </button>
                <button onClick={() => onDelete(team.id)} className={s.icon_button} title="Xóa">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={s.delete_icon_svg} viewBox="0 0 16 16">
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className={s.pagination}>
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={s.pagination_button}
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={currentPage === i + 1 ? s.active : ''}
          >
            {i + 1}
          </button>
        ))}
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={s.pagination_button}
        >
          &gt;
        </button>
      </div>

      {selectedTeam && (
        <TeamModal
          team={selectedTeam}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}

    </div>
  );
} 