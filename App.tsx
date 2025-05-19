import React from 'react';
import {SafeAreaView} from 'react-native';
import {CameraView} from './components/CameraView';

const App = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <CameraView />
    </SafeAreaView>
  );
};

export default App;
