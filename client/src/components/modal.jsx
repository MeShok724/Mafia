import React from 'react';
import '../styles/modal.css'; // Подключите стили для модального окна

const Modal = ({ onClose, onStay, onLeave, children }) => (
    <div className="modal-overlay">
        <div className="modal">
            <button className="close-btn" onClick={onClose}>Закрыть</button>
            {children}
            <div className="modal-buttons">
                <button className="stay-btn" onClick={onStay}>Остаться в комнате</button>
                <button className="leave-btn" onClick={onLeave}>Выйти</button>
            </div>
        </div>
    </div>
);


export default Modal;