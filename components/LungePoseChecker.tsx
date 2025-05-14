import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {runOnJS} from 'react-native-reanimated';
import * as tf from '@tensorflow/tfjs';
import {loadPoseModel, estimatePose} from '../services/poseService';
import {
  Skia,
  Canvas,
  useCanvasRef,
  Image as SkiaImage,
} from '@shopify/react-native-skia';

const LungePoseChecker = () => {
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const canvasRef = useCanvasRef();

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');

      await tf.setBackend('cpu');
      await tf.ready();
      console.log('✅ TensorFlow ready');

      await loadPoseModel();
      console.log('📦 Pose model loaded');
    })();
  }, []);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const result = getJpegFrame(frame); // Отримуємо JPEG через getJpegFrame
    if (result?.jpeg) {
      runOnJS(handleFrame)(result.jpeg); // Передаємо JPEG в handleFrame
    }
  }, []);

  const handleFrame = async (jpegBuffer: Uint8Array) => {
    try {
      const image = Skia.Image.MakeImageFromEncoded(jpegBuffer);
      if (!image) return;

      const tensor = await convertSkiaImageToTensor(image);
      if (tensor) {
        const poses = await estimatePose(tensor); // Оцінка пози
        console.log('🧠 poses:', poses);
      }
    } catch (err) {
      console.error('❌ Frame processing error:', err);
    }
  };

  const convertSkiaImageToTensor = async (
    image: SkiaImage,
  ): Promise<tf.Tensor3D | null> => {
    const width = image.width();
    const height = image.height();

    const pixels = image.readPixels(0, 0, {width, height});
    if (!pixels) return null;

    const rgb = new Uint8Array(width * height * 3);
    for (let i = 0; i < width * height; i++) {
      rgb[i * 3] = pixels[i * 4];
      rgb[i * 3 + 1] = pixels[i * 4 + 1];
      rgb[i * 3 + 2] = pixels[i * 4 + 2];
    }

    return tf.tensor3d(rgb, [height, width, 3], 'int32');
  };

  if (!device || !hasPermission) {
    return <Text>🔒 Waiting for camera permissions or device...</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        pixelFormat="yuv"
        frameProcessor={frameProcessor}
      />
      <Canvas ref={canvasRef} style={StyleSheet.absoluteFill} />
      <View style={styles.overlay}>
        <Text style={styles.text}>
          ✅ Модель завантажена. Перевірка працює.
        </Text>
      </View>
    </View>
  );
};

export default LungePoseChecker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#000000aa',
    padding: 8,
    borderRadius: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});
