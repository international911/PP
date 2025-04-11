import cv2
import numpy as np
import time
import requests
from ultralytics import YOLO
from flask import Flask
from flask_socketio import SocketIO, emit
import eventlet

eventlet.monkey_patch()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Загрузка предобученной модели YOLOv8
model = YOLO('yolov8n.pt')

def process_frame(frame, width, height, parking_spaces):
    """
    Обрабатывает кадр, определяя занятость парковочных мест с использованием модели YOLOv8.

    :param frame: Кадр из видеопотока.
    :param width: Ширина кадра.
    :param height: Высота кадра.
    :param parking_spaces: Список парковочных мест с координатами.
    :return: Обработанный кадр и статус парковочных мест.
    """
    if not parking_spaces:
        print("No parking spaces defined")
        return frame, []

    status = [False] * len(parking_spaces)  # Инициализация состояния парковочных мест

    results = model(frame)
    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            label = result.names[int(box.cls[0])]
            if label == 'car':
                for i, space in enumerate(parking_spaces):
                    denorm_space = [(float(point[0]) * width, float(point[1]) * height) for point in space['parkingSpace']]
                    if (x1 >= min(point[0] for point in denorm_space) and
                        x2 <= max(point[0] for point in denorm_space) and
                        y1 >= min(point[1] for point in denorm_space) and
                        y2 <= max(point[1] for point in denorm_space)):
                        status[i] = True

    frame = draw_parking_spaces(frame, parking_spaces, status, width, height)
    return frame, status

def draw_parking_spaces(frame, parking_spaces, status, width, height):
    """
    Рисует парковочные места на кадре.

    :param frame: Кадр из видеопотока.
    :param parking_spaces: Список парковочных мест с координатами.
    :param status: Статус занятости парковочных мест.
    :param width: Ширина кадра.
    :param height: Высота кадра.
    :return: Кадр с нарисованными парковочными местами.
    """
    for i, space in enumerate(parking_spaces):
        if not isinstance(space, dict) or 'parkingSpace' not in space or len(space['parkingSpace']) != 4:
            print(f"Invalid parking space coordinates at index {i}: {space}")
            continue

        denorm_space = [(float(point[0]) * width, float(point[1]) * height) for point in space['parkingSpace']]
        points = np.array(denorm_space, np.int32)
        points = points.reshape((-1, 1, 2))
        color = (0, 255, 0) if not status[i] else (0, 0, 255)  # Зеленый, если свободно, красный, если занято
        cv2.polylines(frame, [points], isClosed=True, color=color, thickness=2)

        cv2.putText(frame, f"{space['figureNumber']}", (points[0][0][0], points[0][0][1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        cv2.putText(frame, f"{space['username']}", (points[0][0][0], points[0][0][1] + 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    return frame

@app.route('/')
def index():
    return "Camera feed"

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('start_stream')
def handle_start_stream(data):
    global parking_spaces
    print(f"Received data: {data}")
    if isinstance(data, dict) and 'parkingSpaces' in data:
        parking_spaces = data['parkingSpaces']
        if isinstance(parking_spaces, list):
            print(f"Updated parking_spaces: {parking_spaces}")
        else:
            print("Invalid parking_spaces format, expected a list")
            parking_spaces = []
    else:
        parking_spaces = []
        print("Invalid data format, parking_spaces set to empty list")
    print('Starting stream with parking spaces:', parking_spaces)
    while True:
        try:
            timestamp = int(time.time() * 1000)
            url = f"http://124.155.121.218:3000/webcapture.jpg?command=snap&channel=1&{timestamp}"
            response = requests.get(url, timeout=10)  # Добавляем таймаут
            frame = np.frombuffer(response.content, np.uint8)
            frame = cv2.imdecode(frame, cv2.IMREAD_COLOR)
            height, width, _ = frame.shape
            print('Processing frame:', frame.shape)

            processed_frame, status = process_frame(frame, width, height, parking_spaces)
            _, buffer = cv2.imencode('.jpg', processed_frame)
            emit('video_frame', buffer.tobytes())
            emit('update_parking_spaces', {'parkingSpaces': parking_spaces, 'status': status})

            time.sleep(0.1)
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            break
        except Exception as e:
            print(f"Error: {e}")
            break

@socketio.on('save_annotations')
def handle_save_annotations(data):
    global parking_spaces
    print(f"Received annotations data: {data}")
    if isinstance(data, dict):
        print('Received annotations:', data)
        parking_spaces.append(data)
        print('Updated parking spaces:', parking_spaces)
        emit('update_parking_spaces', {'parkingSpaces': parking_spaces, 'status': [False] * len(parking_spaces)})
    else:
        print('Invalid annotations data:', data)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5001)
