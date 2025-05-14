import * as tf from '@tensorflow/tfjs';
import {
  SupportedModels,
  createDetector,
  PoseDetector,
} from '@tensorflow-models/pose-detection';

let detector: PoseDetector | null = null;

export const loadPoseModel = async () => {
  await tf.setBackend('cpu');
  await tf.ready();

  if (!detector) {
    detector = await createDetector(SupportedModels.BlazePose, {
      runtime: 'tfjs',
      modelType: 'full',
    });
  }
};

export const estimatePose = async (tensor: tf.Tensor3D) => {
  if (!detector) throw new Error('Detector not initialized');
  const poses = await detector.estimatePoses(tensor);
  return poses;
};
