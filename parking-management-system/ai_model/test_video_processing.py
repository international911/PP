import pytest
import numpy as np
from video_processing import process_frame, draw_parking_spaces

def test_process_frame_no_parking_spaces():
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    width, height = 640, 480
    parking_spaces = []  # Передаем пустой список
    processed_frame, status = process_frame(frame, width, height, parking_spaces)
    assert status == []


def test_process_frame_with_parking_spaces():
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    width, height = 640, 480
    parking_spaces = [{'parkingSpace': [(0.1, 0.1), (0.1, 0.2), (0.2, 0.2), (0.2, 0.1)], 'figureNumber': 1, 'username': 'user1'}]
    processed_frame, status = process_frame(frame, width, height, parking_spaces)
    assert len(status) == 1
    assert status[0] == False


def test_draw_parking_spaces():
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    width, height = 640, 480
    parking_spaces = [{'parkingSpace': [(0.1, 0.1), (0.1, 0.2), (0.2, 0.2), (0.2, 0.1)], 'figureNumber': 1, 'username': 'user1'}]
    status = [False]
    frame_with_spaces = draw_parking_spaces(frame, parking_spaces, status, width, height)
    assert frame_with_spaces is not None
