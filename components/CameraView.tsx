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

    requestPermissions();
  }, []);

  const testImage = useImage(require('../assets/test.jpg'));

  //   useEffect(() => {
  //     if (testImage) {
  //       setFrame(testImage);
  //     }
  //   }, [testImage]);

  const handleCapture = () => {
    const snapshot = canvasRef.current?.makeImageSnapshot();
    const bytes = snapshot?.encodeToBytes(); // Uint8Array (PNG by default)

    if (bytes) {
      console.log('Captured frame bytes:', bytes);
      console.log('Byte length:', bytes.length);
      // Тут у наступному кроці будемо передавати в TensorFlow
    } else {
      console.warn('Failed to capture snapshot');
    }
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

      <Button title="СДЕЛАТЬ ФОТО" onPress={handleCapture} />
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
