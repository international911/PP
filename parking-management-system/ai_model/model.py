from ultralytics import YOLO
import config

# Загрузка предобученной модели YOLOv8
model = YOLO(config.MODEL_PATH)
