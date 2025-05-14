import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import * as tf from '@tensorflow/tfjs';
import LungePoseChecker from './components/LungePoseChecker'; // шляху залежно від структури

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const prepare = async () => {
      await tf.ready();
      console.log('✅ TensorFlow ready');
    };
    prepare();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Lunge" component={LungePoseChecker} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
