import React, { useState, useEffect, useRef } from 'react';
import s from './style.module.css';
import { motion } from 'framer-motion';

const PlayerModal = ({ player, onSave, onClose, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    position: '',
    type: '',
    notes: ''
  });
  
  const [nameError, setNameError] = useState('');
  
  // State to track if position dropdown is open
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const positionDropdownRef = useRef(null);
  
  // State to track if type dropdown is open 
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);
  
  // Validate player name
  const validateName = (name) => {
    // Allow letters, spaces, and Vietnamese characters
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;
    
    if (!name) {
      return 'Tên cầu thủ không được để trống';
    }
    if (!nameRegex.test(name)) {
      return 'Tên cầu thủ chỉ được chứa chữ cái và khoảng trắng';
    }
    if (name.length < 2) {
      return 'Tên cầu thủ phải có ít nhất 2 ký tự';
    }
    if (name.length > 50) {
      return 'Tên cầu thủ không được vượt quá 50 ký tự';
    }
    return '';
  };
  
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target)) {
        setIsPositionDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [positionDropdownRef, typeDropdownRef]);

  useEffect(() => {
    if (player) {
      setFormData({
        ...player,
        notes: player.notes || ''
      });
    }
  }, [player]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validate name in real-time
    if (name === 'name') {
      const error = validateName(value);
      setNameError(error);
    }
  };
  
  const handlePositionChange = (position) => {
    setFormData({
      ...formData,
      position
    });
    setIsPositionDropdownOpen(false);
  };
  
  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type
    });
    setIsTypeDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate name before submission
    const nameError = validateName(formData.name);
    if (nameError) {
      setNameError(nameError);
      return;
    }
    
    onSave(formData);
  };
  
  // Position options
  const positionOptions = [
    "Forward",
    "Midfielder",
    "Defender",
    "Goalkeeper"
  ];
  
  // Type options
  const typeOptions = [
    "foreign",
    "domestic"
  ];

  return (
    <div className={s.modalOverlay}>
      <motion.div 
        className={s.modalContent}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <h2>{isEditing ? 'Chỉnh sửa cầu thủ' : 'Thêm cầu thủ mới'}</h2>
        
        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.formGroup}>
            <label htmlFor="name">Tên cầu thủ</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên cầu thủ"
              className={nameError ? s.inputError : ''}
            />
            {nameError && <span className={s.errorMessage}>{nameError}</span>}
          </div>
          
          <div className={s.formGroup}>
            <label htmlFor="dateOfBirth">Ngày sinh</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={s.formGroup}>
            <label htmlFor="position">Vị trí</label>
            <div className={s.customPositionDropdown} ref={positionDropdownRef}>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                placeholder="Chọn vị trí"
                readOnly
                onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                className={s.positionInput}
              />
              <div className={s.positionDropdownArrow} onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}></div>
              
              {isPositionDropdownOpen && (
                <div className={s.positionDropdownMenu}>
                  {positionOptions.map((position) => (
                    <div 
                      key={position}
                      className={`${s.positionOption} ${formData.position === position ? s.selected : ''}`}
                      onClick={() => handlePositionChange(position)}
                    >
                      {position}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className={s.formGroup}>
            <label htmlFor="type">Loại cầu thủ</label>
            <div className={s.customTypeDropdown} ref={typeDropdownRef}>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                placeholder="Chọn loại cầu thủ"
                readOnly
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className={s.typeInput}
              />
              <div className={s.typeDropdownArrow} onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}></div>
              
              {isTypeDropdownOpen && (
                <div className={s.typeDropdownMenu}>
                  {typeOptions.map((type) => (
                    <div 
                      key={type}
                      className={`${s.typeOption} ${formData.type === type ? s.selected : ''}`}
                      onClick={() => handleTypeChange(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className={s.formGroup}>
            <label htmlFor="notes">Ghi chú</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Nhập ghi chú cho cầu thủ"
              className={s.textArea}
              rows={4}
            />
          </div>
          
          <div className={s.buttonGroup}>
            <button type="submit" className={s.saveButton}>
              {isEditing ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button type="button" onClick={onClose} className={s.cancelButton}>
              Hủy bỏ
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PlayerModal; 