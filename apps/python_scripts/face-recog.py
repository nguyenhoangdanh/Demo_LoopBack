from io import BytesIO
import math
import face_recognition
import sys
import json
from PIL import Image
import numpy as np

known_face_encodings = []
known_face_names = []
face_encoding = []
unknown_face = []

array_data_json = sys.argv[1]
array_data = json.loads(array_data_json)

buffer_data = sys.stdin.buffer.read()

def face_confidence(face_distance, face_match_threshold=0.6):
    range = (1.0 - face_match_threshold)
    linear_val = (1.0 - face_distance) / (range * 2.0)

    if face_distance > face_match_threshold:
        return str(round(linear_val * 100, 2)) + '%'
    else:
        value = (linear_val + ((1.0 - linear_val) *
                 math.pow((linear_val - 0.5) * 2, 0.2))) * 100
        return str(round(value, 2)) + '%'


def encode_faces():
    for element in array_data:
        known_face_encodings.append(element['encoded'])
        known_face_names.append(element['id'])


encode_faces()
bytes_io = BytesIO(buffer_data)
image = Image.open(bytes_io)
image_rgb = image.convert("RGB")
np_array = np.array(image_rgb)
unknown_face_encoding = face_recognition.face_encodings(np_array)[0]

matches = face_recognition.compare_faces(
    known_face_encodings, unknown_face_encoding)

name = "Unknown"
face_distances = face_recognition.face_distance(known_face_encodings, unknown_face_encoding)
best_match_index = np.argmin(face_distances)

if matches[best_match_index]:
    confidence = face_confidence(
        face_distance=face_distances[best_match_index])
    name = known_face_names[best_match_index]
    print(name)
