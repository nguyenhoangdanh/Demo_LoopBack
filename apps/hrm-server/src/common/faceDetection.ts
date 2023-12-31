import * as faceapi from '@vladmandic/face-api';

export const faceDetectionNet = faceapi.nets.ssdMobilenetv1;

// SsdMobilenetv1Options
const minConfidence = 0.8;

// TinyFaceDetectorOptions
const inputSize = 408;
const scoreThreshold = 0.5;

function getFaceDetectorOptions(net: faceapi.NeuralNetwork<any>) {
  return net === faceapi.nets.ssdMobilenetv1
    ? new faceapi.SsdMobilenetv1Options({ minConfidence })
    : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}

export const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet);
