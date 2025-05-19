import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';

export const CameraView = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const device = useCameraDevice('back');

  useEffect(() => {
    const requestPermissions = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    };

    requestPermissions();
  }, []);

  if (!device) return <Text>Loading camera...</Text>;
  if (!hasPermission) return <Text>No camera permission</Text>;

  return <Camera style={{flex: 1}} device={device} isActive={true} />;
};
