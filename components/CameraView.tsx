import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import {
  Canvas,
  Image as SkiaImage,
  useImage,
  SkImage,
} from '@shopify/react-native-skia';

export const CameraView = () => {
  const device = useCameraDevice('back');
  const [frame, setFrame] = useState<SkImage | null>(null);
  const cameraRef = useRef<Camera>(null);

  // Поки що ми просто завантажимо картинку з assets, щоб протестити Skia
  const testImage = useImage(require('../assets/test.jpg'));

  useEffect(() => {
    if (testImage) {
      setFrame(testImage);
    }
  }, [testImage]);

  if (!device) return null;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
      />

      <Canvas style={styles.canvas}>
        {frame && (
          <SkiaImage image={frame} x={0} y={0} width={300} height={400} />
        )}
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
