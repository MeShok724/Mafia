import React from 'react';
import '../styles/modal.css'; // Подключите стили для модального окна

const Modal = ({ onClose, onStay, onLeave, type, children }) => (
    <div className="modal-overlay">
        {generateModal(onClose, onStay, onLeave, type, children)}
    </div>
);

const generateModal = (onClose, onStay, onLeave, type, children) => {
    if (type === 'gameEnd')
        return (<div className="modal">
            {children}
            <div className="modal-buttons">
                <button className="stay-btn" onClick={onStay}>Остаться в комнате</button>
                <button className="leave-btn" onClick={onLeave}>Выйти</button>
            </div>
        </div>)
    else if (type === 'joinError')
        return (<div className="modal">
            {children}
            <div className="modal-buttons">
                <button className="stay-btn" onClick={onClose}>Ок</button>
            </div>
        </div>)
}
export default Modal;