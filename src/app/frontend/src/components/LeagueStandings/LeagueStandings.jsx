import React from 'react';
import s from "./style.module.css";
import { getTeamLogo } from '../../utils/teamMappings';

const LeagueStandings = ({ teams, reportDate }) => {
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

  return (
    <div className={s.leagueStandings}>
      <div className={s.reportDate}>{`Ngày: ${formattedDate}`}</div>
      <div className={s.standingsTableContainer}>
        <table className={s.standingsTable}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Đội</th>
              <th>Thắng</th>
              <th>Hòa</th>
              <th>Thua</th>
              <th>Hiệu Số</th>
              <th>Điểm</th>
              <th>Hạng</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr
                key={team.stt}
                className={
                  idx < 3
                    ? s.top3Row
                    : idx >= teams.length - 3
                      ? s.bottom3Row
                      : ""
                }
              >
                <td className={s.sttCell}>{team.stt}</td>
                <td className={s.teamCell}>
                  <img src={getTeamLogo(team.name)} alt={team.name} className={s.teamLogo} />
                  <span className={s.teamName}>{team.name}</span>
                </td>
                <td className={s.numCell}>{team.won}</td>
                <td className={s.numCell}>{team.drawn}</td>
                <td className={s.numCell}>{team.lost}</td>
                <td className={s.numCell}>{team.goalDifference}</td>
                <td className={s.numCell}>{team.points}</td>
                <td className={s.rankCell}>{team.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueStandings;