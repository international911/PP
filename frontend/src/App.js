import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import RegistrationForm from './components/RegistrationForm';
import CameraPage from './components/CameraPage';
import AnnotationTool from './components/AnnotationTool';
import UserInfo from './components/UserInfo';
import jwtDecode from 'jwt-decode';
import io from 'socket.io-client';
import './components/styles/App.scss';

const App = () => {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [figures, setFigures] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id);
        setUsername(decodedToken.username);
        setEmail(decodedToken.email);
        setIsRegistered(true);
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }

    const newSocket = io.connect('http://localhost:5001', {
      transports: ['websocket'],
      upgrade: false
    });
    setSocket(newSocket);

    newSocket.on('update_parking_spaces', (data) => {
      const parkingSpaces = data.parkingSpaces;
      console.log('Received parking spaces:', parkingSpaces);
      setFigures(parkingSpaces);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      const reconnectSocket = io.connect('http://localhost:5001', {
        transports: ['websocket'],
        upgrade: false
      });
      setSocket(reconnectSocket);
    });

    const handleBeforeUnload = () => {
      localStorage.removeItem('token');
      if (newSocket) {
        newSocket.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleRegister = (userId, username, email) => {
    setUserId(userId);
    setUsername(username);
    setEmail(email);
    setIsRegistered(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserId('');
    setUsername('');
    setEmail('');
    setIsRegistered(false);
  };

  const handleAnnotationsChange = (newAnnotations) => {
    setAnnotations(newAnnotations);
    if (socket) {
      console.log('Sending annotations to server:', newAnnotations);
      socket.emit('save_annotations', newAnnotations);
    }
  };

  return (
    <div className="app">
      <Header
        userId={userId}
        username={username}
        email={email}
        onLogout={handleLogout}
        setShowCamera={setShowCamera}
        setShowAnnotation={setShowAnnotation}
        showCamera={showCamera}
        showAnnotation={showAnnotation}
        setShowUserInfo={setShowUserInfo}
        showUserInfo={showUserInfo}
      />
      <MainContent />
      {!isRegistered && !showCamera && !showAnnotation && <RegistrationForm onRegister={handleRegister} />}
      {showCamera && <CameraPage annotations={annotations} />}
      {showAnnotation && <AnnotationTool userId={userId} username={username} onAnnotationsChange={handleAnnotationsChange} />}
      {showUserInfo && <UserInfo userId={userId} username={username} email={email} onLogout={handleLogout} onClose={() => setShowUserInfo(false)} figures={figures} />}
    </div>
  );
};

export default App;
