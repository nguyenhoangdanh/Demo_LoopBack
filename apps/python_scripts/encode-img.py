from io import BytesIO
import json
import face_recognition
import sys
from PIL import Image
import numpy as np
import urllib.request
import os


def encode_face():
    file_path = sys.argv[1]

    array_response = []
    for image in os.listdir(file_path):
        # array_response.append(image)
        face_image = face_recognition.load_image_file(f"{file_path}/{image}")
        face_encoding = face_recognition.face_encodings(face_image)[0]
        res_mapping = {"id": image.split('.', 1)[0], "encoded": face_encoding}

        array_response.append(res_mapping) 
    return array_response


res = encode_face()
print(res)
