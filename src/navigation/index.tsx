import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { LegalScreen } from '../screens/auth/LegalScreen';
import { HomeScreen } from '../screens/main/HomeScreen';
import { ExploreScreen } from '../screens/main/ExploreScreen';
import { MapScreen } from '../screens/main/MapScreen';
import { MessagesScreen } from '../screens/main/MessagesScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { ExchangeDetailScreen } from '../screens/main/ExchangeDetailScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { EditProfileScreen } from '../screens/main/EditProfileScreen';
import { RatingScreen } from '../screens/main/RatingScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ExchangeHistoryScreen } from '../screens/main/ExchangeHistoryScreen';
import { MyReviewsScreen } from '../screens/main/MyReviewsScreen';
import { VerifyAccountScreen } from '../screens/main/VerifyAccountScreen';
import { HelpScreen } from '../screens/main/HelpScreen';
import { DesignPickerScreen } from '../screens/DesignPickerScreen';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingTop: 8,
        height: 70,
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarIcon: ({ focused, color, size }) => {
        const icons: Record<string, [string, string]> = {
          Home: ['home', 'home-outline'],
          Explore: ['search', 'search-outline'],
          Map: ['map', 'map-outline'],
          Messages: ['chatbubbles', 'chatbubbles-outline'],
          Profile: ['person', 'person-outline'],
        };
        const [active, inactive] = icons[route.name] ?? ['help', 'help-outline'];
        return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Accueil' }} />
    <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: 'Explorer' }} />
    <Tab.Screen name="Map" component={MapScreen} options={{ tabBarLabel: 'Carte' }} />
    <Tab.Screen name="Messages" component={MessagesScreen} options={{ tabBarLabel: 'Messages' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ExchangeDetail" component={ExchangeDetailScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Rating" component={RatingScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="ExchangeHistory" component={ExchangeHistoryScreen} />
            <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
            <Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} />
            <Stack.Screen name="DesignPicker" component={DesignPickerScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
