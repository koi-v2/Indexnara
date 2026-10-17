import React from 'react';
import { useGame } from '../context/GameContext';

export default function Modal() {
  const { modal, closeModal } = useGame();

  if (!modal.isOpen) return null;

  return (
    <div className="modalback show" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {modal.title && <h3>{modal.title}</h3>}
        {modal.content}
      </div>
    </div>
  );
}
