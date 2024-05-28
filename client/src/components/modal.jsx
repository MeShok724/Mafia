import React from 'react';
import '../styles/modal.css'; // Подключите стили для модального окна

const Modal = ({ onClose, children }) => (
    <div className="modal-overlay">
        <div className="modal">
            <button onClick={onClose}>Закрыть</button>
            {children}
        </div>
    </div>
);

export default Modal;