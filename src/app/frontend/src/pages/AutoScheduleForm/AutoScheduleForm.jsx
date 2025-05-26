import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { generateSchedule } from '../../api/scheduleApi';
import s from './style.module.css';
import SaveButton from '../../components/SaveButton/SaveButton';
import Input from '../../components/Input/Input';

const AutoScheduleForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startDate: '',
    daysBetweenRounds: 7
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn tạo lịch đấu tự động?\n' +
      'Hành động này sẽ tạo lịch đấu mới cho toàn bộ giải đấu.'
    );
    
    if (!confirmed) return;

    try {
      await generateSchedule(formData.startDate, parseInt(formData.daysBetweenRounds));
      toast.success('Lịch đấu đã được tạo thành công!');
      navigate('/admin/schedule/edit');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo lịch đấu');
    }
  };

  return (
    <div className={s.form_container}>
      <form onSubmit={handleSubmit}>
        <div className={s.input_group}>
          <label htmlFor="startDate">Ngày bắt đầu</label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onTextChange={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
          />
        </div>

        <div className={`${s.input_group} ${s.input_group_number}`}>
          <label htmlFor="daysBetweenRounds">Số ngày giữa các vòng đấu</label>
          <Input
            id="daysBetweenRounds"
            type="number"
            value={formData.daysBetweenRounds}
            onTextChange={(value) => setFormData(prev => ({ ...prev, daysBetweenRounds: value }))}
            min="1"
            max="14"
          />
        </div>

        <SaveButton onClick={handleSubmit} />
      </form>
    </div>
  );
};

export default AutoScheduleForm; 