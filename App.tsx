import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signup from './app/(auth)/signup';
import Login from './app/(auth)/login';
import Home from './app/(tabs)/index';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: true, // you can hide headers if you prefer
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ title: 'Login to AgroLink' }} 
        />
        <Stack.Screen 
          name="Signup" 
          component={Signup} 
          options={{ title: 'Sign Up for AgroLink' }} 
        />
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ title: 'AgroLink Home' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
