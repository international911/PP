import cv2
import sys
import model
import utils
import config

def detect_objects(image_path):
    image = utils.load_image(image_path)
    results = model.model(image)
    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            label = result.names[int(box.cls[0])]
            confidence = box.conf[0]
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(image, f'{label} {confidence:.2f}', (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    utils.save_image(image, config.OUTPUT_PATH)
    return config.OUTPUT_PATH

if __name__ == "__main__":
    image_path = sys.argv[1] if len(sys.argv) > 1 else config.IMAGE_PATH
    output_path = detect_objects(image_path)
    print(f'Results saved to {output_path}')
