import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addPlayer, updatePlayer, deletePlayer } from "../../store/team/team-slice";

import binIconSrc from "/assets/bin.png";
import leftIconSrc from "/assets/left_arrow.png";
import plusIconSrc from "/assets/plus.png";

import s from "./style.module.css";

export default function PlayersTable() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { players } = useSelector((state) => state.teamSlice);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    dateOfBirth: "",
    position: "",
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [editPlayer, setEditPlayer] = useState(null);

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (newPlayer.name && newPlayer.dateOfBirth && newPlayer.position) {
      dispatch(addPlayer(newPlayer));
      setNewPlayer({ name: "", dateOfBirth: "", position: "" });
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditPlayer({ ...players[index] });
  };

  const handleUpdate = () => {
    dispatch(updatePlayer({ index: editingIndex, player: editPlayer }));
    setEditingIndex(null);
    setEditPlayer(null);
  };

  const handleDelete = (index) => {
    dispatch(deletePlayer(index));
  };

  return (
    <div className={s.table_container}>
      <button className={s.back_button} onClick={() => navigate("/admin/teams/add")}>
        <img src={leftIconSrc} alt="back button" className={s.icon} />
      </button>

      <table className={s.table}>
        <thead>
          <tr>
            <th>Cầu thủ</th>
            <th>Ngày sinh</th>
            <th>Vị trí</th>
            <th>Loại cầu thủ</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={index}>
              {editingIndex === index ? (
                <>
                  <td>
                    <input
                      value={editPlayer.name}
                      onChange={(e) => setEditPlayer({ ...editPlayer, name: e.target.value })}
                    />
                  </td>
                  
                  <td>
                    <input
                      type="date"
                      value={editPlayer.dateOfBirth}
                      onChange={(e) => setEditPlayer({ ...editPlayer, dateOfBirth: e.target.value })}
                    />
                  </td>
                  
                  <td>
                    <input
                      value={editPlayer.position}
                      onChange={(e) => setEditPlayer({ ...editPlayer, position: e.target.value })}
                    />
                  </td>
                  
                  <td>
                    <button onClick={handleUpdate}>Save</button>
                  </td>

                </>
              ) : (
                <>
                  <td>{player.name}</td>
                  <td>{player.dateOfBirth}</td>
                  <td>{player.position}</td>

                  <td>
                    <button onClick={() => handleDelete(index)}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        fill="currentColor" 
                        class="bi bi-trash3-fill" 
                        viewBox="0 0 16 16"
                      >
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                      </svg>
                    </button>
                    
                    <button onClick={() => handleEdit(index)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-pencil"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                      </svg>
                    </button>
                    
                  </td>

                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="s.form_container">
        <form className={s.add_player_form} onSubmit={handleAddPlayer}>
          <input
            placeholder="Tên cầu thủ"
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
            />
          <input
            type="date"
            value={newPlayer.dateOfBirth}
            onChange={(e) => setNewPlayer({ ...newPlayer, dateOfBirth: e.target.value })}
            />
          <input
            placeholder="Vị trí"
            value={newPlayer.position}
            onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
            />
          <input
            placeholder="Loại cầu thủ"
            value={newPlayer.type}
            onChange={(e) => setNewPlayer({ ...newPlayer, type: e.target.value })}
            />
          <button type="submit" className={s.add_button}>
            <img src={plusIconSrc} alt="plus icon" className={s.icon}/>
          </button>

        </form>
      </div>


    </div>
  );
}