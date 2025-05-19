import {useEffect, useState} from 'react';
import '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

export const useMoveNet = () => {
  const [ready, setReady] = useState(false);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(
    null,
  );

  useEffect(() => {
    const init = async () => {
      await tf.ready();

      const det = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        },
      );

      setDetector(det);
      setReady(true);
    };

    init();
  }, []);

  return {detector, ready};
};
