import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'; 
import parkingImage from '../assets/photo_2024-12-15_22-55-20.jpg'; 
import UserInfo from './UserInfo';
import userIcon from '../assets/icons8-male-user-64 (1).png'; 
import './styles/Header.scss';

const Header = ({ userId, username, email, onLogout, setShowCamera, setShowAnnotation, showCamera, showAnnotation, setShowUserInfo, showUserInfo }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io.connect('http://localhost:5001', {
      transports: ['websocket'],
      upgrade: false
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      const reconnectSocket = io.connect('http://localhost:5001', {
        transports: ['websocket'],
        upgrade: false
      });
      setSocket(reconnectSocket);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleCameraClick = () => {
    setShowAnnotation(false);
    setShowCamera(true);
    console.log('Switched to Camera mode');
    if (socket) {
      socket.emit('start_stream', { parkingSpaces: [] });
    }
  };

  const handleAnnotationClick = () => {
    setShowCamera(false);
    setShowAnnotation(true);
    console.log('Switched to Annotation mode');
    if (socket) {
      socket.emit('start_stream', { parkingSpaces: [] });
    }
  };

  const handleHomeClick = () => {
    setShowCamera(false);
    setShowAnnotation(false);
    console.log('Switched to Home mode');
  };

  return (
    <header className="header" style={{ backgroundImage: `url(${parkingImage})` }}>
      <div className="header-content">
        <h1>Подсистема управления парковочным пространством</h1>
        <p>Помощь водителям с парковочными местами в городе</p>
        <div className="buttons">
          {!showCamera && !showAnnotation && <button onClick={handleCameraClick} className="camera-button">Камера</button>}
          {showCamera && <button onClick={handleHomeClick} className="camera-button">Главная</button>}
          {!showAnnotation && !showCamera && <button onClick={handleAnnotationClick} className="camera-button">Разметка</button>}
          {showAnnotation && <button onClick={handleHomeClick} className="camera-button">Главная</button>}
          {showCamera && <button onClick={handleAnnotationClick} className="camera-button">Разметка</button>}
          {showAnnotation && <button onClick={handleCameraClick} className="camera-button">Камера</button>}
        </div>
        <div className="user-icon" onClick={() => setShowUserInfo(!showUserInfo)}>
          <img src={userIcon} alt="User" />
        </div>
      </div>
      {showUserInfo && <UserInfo userId={userId} username={username} email={email} onLogout={onLogout} onClose={() => setShowUserInfo(false)} />}
    </header>
  );
};

export default Header;
