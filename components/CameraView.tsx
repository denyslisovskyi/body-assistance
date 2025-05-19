import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Button, Text} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import {
  Canvas,
  useCanvasRef,
  Image as SkiaImage,
  useImage,
  SkImage,
} from '@shopify/react-native-skia';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import {PNG} from 'pngjs/browser';
import {Buffer} from 'buffer';

global.Buffer = Buffer; // 👈 потрібно для pngjs

export const CameraView = () => {
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [frame, setFrame] = useState<SkImage | null>(null);
  const canvasRef = useCanvasRef();

  useEffect(() => {
    const requestPermissions = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    };

    const prepareTF = async () => {
      await tf.ready();
      console.log('✅ TensorFlow ready');
    };

    requestPermissions();
    prepareTF();
  }, []);

  const testImage = useImage(require('../assets/test.jpg'));

  useEffect(() => {
    if (testImage) {
      setFrame(testImage);
    }
  }, [testImage]);

  const handleCapture = async () => {
    const snapshot = canvasRef.current?.makeImageSnapshot();
    const bytes = snapshot?.encodeToBytes(); // PNG by default

    if (!bytes) {
      console.warn('❌ No snapshot bytes');
      return;
    }

    console.log('Captured PNG bytes:', bytes.length);

    // Decode PNG → RGBA
    const png = PNG.sync.read(Buffer.from(bytes));
    const {width, height, data} = png;

    console.log('✅ Decoded PNG:', {width, height, byteLength: data.length});

    // Create Tensor
    const imageTensor = tf.browser.fromPixels({data, width, height}, 3); // RGB

    console.log('✅ Tensor shape:', imageTensor.shape); // Should be [height, width, 3]
  };

  if (!device || !hasPermission) {
    return <Text>Loading or no permission</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} device={device} isActive={true} />

      <Canvas ref={canvasRef} style={styles.canvas}>
        {frame && (
          <SkiaImage image={frame} x={0} y={0} width={300} height={400} />
        )}
      </Canvas>

      <Button title="📸 Снять кадр и создать Tensor" onPress={handleCapture} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  camera: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  canvas: {
    position: 'absolute',
    width: 300,
    height: 400,
    top: 50,
    left: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
