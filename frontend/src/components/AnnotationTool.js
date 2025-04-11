import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Circle, Line, Text } from 'react-konva';
import io from 'socket.io-client';
import './styles/AnnotationTool.scss';

const AnnotationTool = ({ onAnnotationsChange, userId, username }) => {
  const [points, setPoints] = useState([]);
  const [videoFrame, setVideoFrame] = useState(null);
  const [figureNumber, setFigureNumber] = useState(0);
  const [socket, setSocket] = useState(null);
  const stageRef = useRef(null);

  const connectSocket = useCallback(() => {
    const newSocket = io.connect('http://localhost:5001', {
      transports: ['websocket'],
      upgrade: false
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('start_stream', { parkingSpaces: [] });
    });

    newSocket.on('video_frame', (data) => {
      const arrayBufferView = new Uint8Array(data);
      const blob = new Blob([arrayBufferView], { type: 'image/jpeg' });
      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(blob);
      setVideoFrame(imageUrl);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    connectSocket();
  }, [connectSocket]);

  const handleStageMouseDown = (e) => {
    if (userId && points.length < 4) {
      const pos = stageRef.current.getPointerPosition();
      addPoint(pos.x, pos.y);
    }
  };

  const addPoint = (x, y) => {
    setPoints((prevPoints) => [...prevPoints, { x, y }]);
  };

  const handleClearAnnotations = () => {
    if (userId) {
      setPoints([]);
      if (onAnnotationsChange) {
        onAnnotationsChange([]);
      }
    }
  };

  const handleSaveAnnotations = () => {
    if (userId && points.length === 4) {
      if (onAnnotationsChange) {
        const width = stageRef.current.width();
        const height = stageRef.current.height();
        const parkingSpace = points.map(point => [point.x / width, point.y / height]);
        console.log('Saving annotations:', {
          figureNumber: figureNumber,
          username: username,
          parkingSpace: parkingSpace
        });
        onAnnotationsChange({
          figureNumber: figureNumber,
          username: username,
          parkingSpace: parkingSpace
        });
        setFigureNumber(figureNumber + 1);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (stageRef.current) {
        stageRef.current.setAttrs({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="annotation-tool">
      <h2>Аннотирование парковочных мест</h2>
      <div className="video-container">
        {videoFrame && <img src={videoFrame} alt="Camera feed" className="camera-feed" />}
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleStageMouseDown}
          ref={stageRef}
        >
          <Layer>
            {points.map((point, index) => (
              <React.Fragment key={index}>
                <Circle
                  x={point.x}
                  y={point.y}
                  radius={5}
                  fill="red"
                  draggable
                  onDragEnd={(e) => {
                    const newPoints = points.map((p, i) =>
                      i === index ? { x: e.target.x(), y: e.target.y() } : p
                    );
                    setPoints(newPoints);
                  }}
                />
                {index > 0 && (
                  <Line
                    points={[points[index - 1].x, points[index - 1].y, point.x, point.y]}
                    stroke="blue"
                    strokeWidth={2}
                  />
                )}
              </React.Fragment>
            ))}
            {points.length === 4 && (
              <Text
                x={points[0].x}
                y={points[0].y - 10}
                text={`${username}`}
                fontSize={12}
                fill="white"
              />
            )}
          </Layer>
        </Stage>
      </div>
      <div className="buttons">
        <button onClick={handleClearAnnotations} className="camera-button">Очистить разметки</button>
        <button onClick={handleSaveAnnotations} className="camera-button">Сохранить разметки</button>
      </div>
    </div>
  );
};

export default AnnotationTool;
