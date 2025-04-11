import React from 'react';
import './styles/UserInfo.scss';

const UserInfo = ({ userId, username, email, onLogout, onClose, figures }) => {
  return (
    <div className="user-info">
      <div className="user-info-content">
        <h2>Аккаунт пользователя</h2>
        <p>ID: {userId}</p>
        <p>Имя пользователя: {username}</p>
        <p>Email: {email}</p>
        {figures && figures.length > 0 && (
          <div>
            <h3>Созданные фигуры:</h3>
            <ul>
              {figures.map((figure, index) => (
                <li key={index}>
                  Номер фигуры: {figure.figureNumber}, Имя пользователя: {figure.username}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={onLogout} className="logout-button">Выйти</button>
        <button onClick={onClose} className="close-button">Закрыть</button>
      </div>
    </div>
  );
};

export default UserInfo;
