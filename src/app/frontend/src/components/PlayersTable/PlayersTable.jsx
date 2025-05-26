import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addPlayer, updatePlayer, deletePlayer } from "../../store/team/team-slice";

import leftIconSrc from "/assets/left_arrow.png";
import plusIconSrc from "/assets/plus.png";

import s from "./style.module.css";
import PlayerModal from "../PlayerModal/PlayerModal";

export default function PlayersTable() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { players } = useSelector((state) => state.teamSlice);
  
  const [showModal, setShowModal] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const playersPerPage = 11;

  const handleAddPlayer = () => {
    setCurrentPlayer({
      name: "",
      dateOfBirth: "",
      position: "",
      type: "", 
      notes: ""
    });
    setEditingIndex(null);
    setShowModal(true);
  };

  const handleEdit = (index) => {
    setCurrentPlayer({ ...players[index] });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = (index) => {
    dispatch(deletePlayer(index));
  };

  const handleSavePlayer = (player) => {
    if (editingIndex !== null) {
      dispatch(updatePlayer({ index: editingIndex, player }));
    } else {
      dispatch(addPlayer(player));
    }
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleBackToTeamForm = () => {
    navigate("/admin/teams/add");
  };

  // Calculate pagination
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = players.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(players.length / playersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className={s.table_container}>
      <button className={s.back_button} onClick={handleBackToTeamForm}>
        <img src={leftIconSrc} alt="back button" className={s.icon} />
      </button>

      <div className={s.table_header}>
        <h2>Danh sách cầu thủ</h2>
        <button className={s.add_button} onClick={handleAddPlayer}>
          <img src={plusIconSrc} alt="add player" className={s.icon}/>
        </button>
      </div>

      <table className={s.table}>
        <thead>
          <tr>
            <th>Tên cầu thủ</th>
            <th>Ngày sinh</th>
            <th>Vị trí</th>
            <th>Loại cầu thủ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentPlayers.map((player, index) => (
            <tr key={index + indexOfFirstPlayer}>
              <td>{player.name}</td>
              <td>{player.dateOfBirth}</td>
              <td>{player.position || "Chưa có"}</td>
              <td>{player.type || "Trong nước"}</td>
              <td className={s.action_buttons}>
                <button onClick={() => handleEdit(index + indexOfFirstPlayer)} className={s.icon_button}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className={s.edit_icon_svg}
                    viewBox="0 0 16 16"
                  >
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                  </svg>
                </button>

                <button onClick={() => handleDelete(index + indexOfFirstPlayer)} className={s.icon_button}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    fill="currentColor" 
                    className={s.delete_icon_svg}
                    viewBox="0 0 16 16"
                  >
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                  </svg>
                </button>
              </td> 
            </tr>
          ))}
        </tbody>
      </table>

      <div className={s.pagination}>
        <button onClick={prevPage} disabled={currentPage === 1}>
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={currentPage === i + 1 ? s.active : ''}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          &gt;
        </button>
      </div>

      {showModal && (
        <PlayerModal
          player={currentPlayer}
          onSave={handleSavePlayer}
          onClose={handleCloseModal}
          isEditing={editingIndex !== null}
        />
      )}
    </div>
  );
}