import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './styles/CameraPage.scss';

const CameraPage = ({ annotations }) => {
  const imgRef = useRef(null);
  const socketRef = useRef(null);
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [status, setStatus] = useState([]);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:5001', {
      transports: ['websocket'],
      upgrade: false
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      socketRef.current.emit('start_stream', { parkingSpaces: annotations });
    });

    socketRef.current.on('video_frame', (data) => {
      const arrayBufferView = new Uint8Array(data);
      const blob = new Blob([arrayBufferView], { type: 'image/jpeg' });
      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(blob);
      imgRef.current.src = imageUrl;
      imgRef.current.onload = () => {
        setVideoDimensions({ width: imgRef.current.width, height: imgRef.current.height });
      };
      console.log('Video frame received:', data);
    });

    socketRef.current.on('update_parking_spaces', (data) => {
      const parkingSpaces = data.parkingSpaces;
      const status = data.status;
      console.log('Updated parking spaces:', parkingSpaces);
      console.log('Status:', status);

      // Логирование координат для проверки
      parkingSpaces.forEach((space, index) => {
        console.log(`Parking space ${index}:`, space.parkingSpace);
      });

      setParkingSpaces(parkingSpaces);
      setStatus(status);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [annotations]);

  const getScaledPoints = (points, width, height) => {
    return points.map(point => `${point[0] * width}%,${point[1] * height}%`).join(' ');
  };

  return (
    <div className="camera-page">
      <h1>Трансляция парковки</h1>
      <div className="video-container" style={{ position: 'relative' }}>
        <img ref={imgRef} alt="Camera feed" className="camera-feed" />
        {parkingSpaces.length > 0 && status.length > 0 && videoDimensions.width > 0 && videoDimensions.height > 0 && (
          <svg className="parking-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {parkingSpaces.map((space, index) => {
              if (!space || !space.parkingSpace || space.parkingSpace.length !== 4) {
                console.error(`Invalid parking space coordinates at index ${index}: ${space}`);
                return null;
              }
              const points = getScaledPoints(space.parkingSpace, videoDimensions.width, videoDimensions.height);
              return (
                <polygon
                  key={index}
                  points={points}
                  fill={status[index] ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)'}
                  stroke={status[index] ? 'red' : 'green'}
                  strokeWidth="2"
                />
              );
            })}
            {parkingSpaces.map((space, index) => (
              <text
                key={`username-${index}`}
                x={space.parkingSpace[0][0] * videoDimensions.width}
                y={space.parkingSpace[0][1] * videoDimensions.height - 10}
                fill="white"
                fontSize="12"
              >
                {space.username}
              </text>
            ))}
            {parkingSpaces.map((space, index) => (
              <text
                key={`figureNumber-${index}`}
                x={space.parkingSpace[0][0] * videoDimensions.width}
                y={space.parkingSpace[0][1] * videoDimensions.height + 10}
                fill="white"
                fontSize="12"
              >
                {space.figureNumber}
              </text>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
};

export default CameraPage;
