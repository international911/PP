import cv2
import config

def load_image(image_path):
    return cv2.imread(image_path)

def save_image(image, output_path):
    cv2.imwrite(output_path, image)

def draw_parking_spaces(frame, parking_spaces, status):
    for space, is_occupied in zip(parking_spaces, status):
        color = (0, 0, 255) if is_occupied else (0, 255, 0)
        cv2.rectangle(frame, (space[0], space[1]), (space[2], space[3]), color, 2)
    return frame
