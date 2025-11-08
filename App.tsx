import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signup from './app/(auth)/signup';
import Login from './app/(auth)/login';
import Home from './app/(tabs)/index';
import CreateListing from './app/(tabs)/create-listing';
import ListingDetails from './app/(tabs)/listings/[id]';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  CreateListing: undefined;
  ListingDetails: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: true,
        }}
      >
        {/* Auth Screens */}
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

        {/* Main App Screens */}
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: 'AgroLink Home' }}
        />
        <Stack.Screen
          name="CreateListing"
          component={CreateListing}
          options={{ title: 'Create Listing' }}
        />
        <Stack.Screen
          name="ListingDetails"
          component={ListingDetails}
          options={{ title: 'Listing Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
