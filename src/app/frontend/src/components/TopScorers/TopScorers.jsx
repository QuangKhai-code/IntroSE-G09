import React, { useState } from 'react';
import s from "./style.module.css";

// Hàm loại bỏ dấu tiếng Việt để tìm kiếm không dấu
function removeVietnameseTones(str) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

const TopScorers = ({ players, reportDate }) => {
  // Format ngày sang DD/MM/YYYY
  let formattedDate = ".................................";
  if (reportDate) {
    const d = new Date(reportDate);
    if (!isNaN(d)) {
      formattedDate = d.toLocaleDateString('vi-VN');
    } else if (typeof reportDate === "string" && reportDate.includes(" ")) {
      const [datePart] = reportDate.split(" ");
      const [y, m, day] = datePart.split("-");
      formattedDate = `${day}/${m}/${y}`;
    }
  }

  // State cho sort, phân trang, tìm kiếm, filter đội
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' hoặc 'asc'
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const playersPerPage = 10;

  // Lấy danh sách đội bóng duy nhất
  const teamList = Array.from(new Set(players.map(p => p.team_name))).sort();

  // Lọc cầu thủ theo tên và đội
  const filteredPlayers = players.filter(player => {
    const name = removeVietnameseTones(player.name.toLowerCase());
    const search = removeVietnameseTones(searchTerm.toLowerCase());
    const matchName = name.includes(search);
    const matchTeam = !selectedTeam || player.team_name === selectedTeam;
    return matchName && matchTeam;
  });

  // Sắp xếp cầu thủ theo số bàn thắng
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortOrder === 'desc') return b.total_goals - a.total_goals;
    return a.total_goals - b.total_goals;
  });

  // Lấy 10 cầu thủ cho trang hiện tại
  const paginatedPlayers = sortedPlayers.slice((page - 1) * playersPerPage, page * playersPerPage);

  // Tổng số trang
  const totalPages = Math.ceil(sortedPlayers.length / playersPerPage);

  return (
    <>
      <div className={s.reportDate} style={{marginBottom: 18, textAlign: 'center'}}>{`Ngày: ${formattedDate}`}</div>
      <div className={s.topScorers}>
        {/* Title that changes based on search/filter */}
        <h2 className={s.title} style={{textAlign: 'center', marginBottom: 20, color: '#000000'}}>
          {searchTerm || selectedTeam ? 'Kết quả tìm kiếm cầu thủ' : 'Bảng xếp hạng cầu thủ ghi bàn'}
        </h2>
        {/* Tra cứu cầu thủ và filter đội bóng */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <select
              value={selectedTeam}
              onChange={e => { setSelectedTeam(e.target.value); setPage(1); }}
              style={{ padding: '8px 12px', fontSize: 16, borderRadius: 8, border: '1px solid #ccc', minWidth: 160 }}
            >
              <option value="">Tất cả đội bóng</option>
              {teamList.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="Tra cứu cầu thủ..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              style={{ padding: '8px 16px', fontSize: 16, borderRadius: 8, border: '1px solid #ccc', minWidth: 220 }}
            />
          </div>
        </div>
        <div className={s.tableContainer}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.leftAlign}>STT</th>
                <th className={s.leftAlign}>Cầu Thủ</th>
                <th className={s.leftAlign}>Đội</th>
                <th className={s.leftAlign}>Loại Cầu Thủ</th>
                <th className={s.sortableHeader} onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
                  Số Bàn Thắng
                  <span style={{ verticalAlign: 'middle', display: 'inline-block' }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 8L12 14H20L16 8Z" fill={sortOrder === 'asc' ? '#6c3483' : '#d1c4e9'} />
                      <path d="M16 24L20 18H12L16 24Z" fill={sortOrder === 'desc' ? '#6c3483' : '#d1c4e9'} />
                    </svg>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlayers.map((player, idx) => (
                <tr
                  key={player.id}
                >
                  <td className={s.sttCell}>{(page - 1) * playersPerPage + idx + 1}</td>
                  <td className={s.playerCell}>{player.name}</td>
                  <td className={s.teamCell}>{player.team_name}</td>
                  <td className={s.typeCell}>{player.player_type_display}</td>
                  <td className={s.goalsCell} style={{ textAlign: 'right' }}>{player.total_goals}</td>
                </tr>
              ))}
              {paginatedPlayers.length === 0 && (
                <tr className={s.noResultRow}><td colSpan={5}>Không tìm thấy cầu thủ phù hợp</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 18 }}>
          <button className={s.paginationBtn} onClick={() => setPage(page - 1)} disabled={page === 1} aria-label="Trang trước">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 15L8 10L13 5" stroke="#6c3483" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span style={{ margin: '0 8px', fontWeight: 700, fontSize: 16 }}>{page}/{totalPages || 1}</span>
          <button className={s.paginationBtn} onClick={() => setPage(page + 1)} disabled={page === totalPages || totalPages === 0} aria-label="Trang sau">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 5L12 10L7 15" stroke="#6c3483" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default TopScorers; 