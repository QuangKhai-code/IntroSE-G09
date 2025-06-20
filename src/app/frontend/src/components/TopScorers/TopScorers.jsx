import React, { useState, useEffect } from 'react';
import s from "./style.module.css";

// Hàm loại bỏ dấu tiếng Việt để tìm kiếm không dấu
function removeVietnameseTones(str) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

const TopScorers = ({ players, reportDate, mode = 'ranking' }) => {
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
  const [pageInput, setPageInput] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const playersPerPage = 10;

  // Lấy danh sách đội bóng duy nhất
  const teamList = Array.from(new Set(players.map(p => p.team_name))).sort();

  // Lọc cầu thủ theo tên và đội
  const filteredPlayers = players.filter(player => {
    const matchTeam = !selectedTeam || player.team_name === selectedTeam;

    if (mode === 'ranking') {
      return matchTeam;
    }

    const name = removeVietnameseTones(player.name.toLowerCase());
    const search = removeVietnameseTones(searchTerm.toLowerCase());
    const matchName = name.includes(search);
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

  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageJump = (e) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(pageInput, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= (totalPages || 1)) {
        setPage(pageNum);
      } else {
        setPageInput(page.toString());
      }
    }
  };

  return (
    <>
      <div className={s.reportDate} style={{marginBottom: 18, textAlign: 'center'}}>{`Ngày: ${formattedDate}`}</div>
      <div className={s.topScorers}>
        {/* Title that changes based on search/filter */}
        <h2 className={s.title} style={{textAlign: 'center', marginBottom: 20, color: '#000000'}}>
          {mode === 'search'
            ? (searchTerm || selectedTeam ? 'Kết quả tìm kiếm cầu thủ' : 'Tìm kiếm cầu thủ')
            : 'Bảng xếp hạng cầu thủ ghi bàn'}
        </h2>
        <div className={s.tableContainer} style={{marginBottom: 0}}>
          <div className={s.searchContainer}>
            {(mode === 'search' || (mode === 'ranking' && teamList.length > 0)) && (
              <div className={s.searchBarRow}>
                <select
                  className={s.searchControl}
                  value={selectedTeam}
                  onChange={e => { setSelectedTeam(e.target.value); setPage(1); }}
                >
                  <option value="">Tất cả đội bóng</option>
                  {teamList.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>

                {mode === 'search' && (
                  <>
                    <input
                      className={s.searchControl}
                      type="text"
                      placeholder="Tra cứu cầu thủ..."
                      value={pendingSearchTerm}
                      onChange={e => setPendingSearchTerm(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setSearchTerm(pendingSearchTerm);
                          setPage(1);
                        }
                      }}
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      className={s.searchIconBtn}
                      type="button"
                      aria-label="Tìm kiếm"
                      onClick={() => {
                        setSearchTerm(pendingSearchTerm);
                        setPage(1);
                      }}
                      style={{ position: 'relative', right: 44, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="7" stroke="#7c4dff" strokeWidth="2" />
                        <line x1="16.018" y1="16.485" x2="21" y2="21.5" stroke="#7c4dff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.sttHeader}>STT</th>
                <th className={s.playerHeader}>Cầu Thủ</th>
                <th className={s.teamHeader}>Đội</th>
                <th className={s.typeHeader}>Loại Cầu Thủ</th>
                <th className={s.goalsHeader} onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
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
                  <td className={s.goalsCell}>{player.total_goals}</td>
                </tr>
              ))}
              {paginatedPlayers.length === 0 && (
                <tr className={s.noResultRow}><td colSpan={5}>Không có kết quả nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={s.paginationContainer}>
          <button className={s.paginationBtn} onClick={() => setPage(page - 1)} disabled={page === 1} aria-label="Trang trước">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 15L8 10L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={s.pageInfo}>
            <input
              type="text"
              className={s.pageInput}
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageJump}
            />
            <span className={s.pageTotal}>/ {totalPages || 1}</span>
          </div>
          <button className={s.paginationBtn} onClick={() => setPage(page + 1)} disabled={page === totalPages || totalPages === 0} aria-label="Trang sau">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 5L12 10L7 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default TopScorers; 