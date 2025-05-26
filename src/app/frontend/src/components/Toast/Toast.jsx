import React, { useEffect } from 'react';
import s from './style.module.css';

export default function Toast({ message, onClose, duration = 3000, bgcolor = '#ff4d4f', color = '#fff' }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={s.toast}>
      <div className={s.toast_content} style={{ backgroundColor: bgcolor , color: color}}>
        <span className={s.message}>{message}</span>
        <button className={s.close_button} onClick={onClose}>×</button>
      </div>
    </div>
  );
} 