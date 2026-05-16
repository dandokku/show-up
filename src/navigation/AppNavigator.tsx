import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../api/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../types';

// Screens (to be created)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LecturerDashboard from '../screens/lecturer/LecturerDashboard';
import ActiveSessionScreen from '../screens/lecturer/ActiveSessionScreen';
import StudentDashboard from '../screens/student/StudentDashboard';
import ScannerScreen from '../screens/student/ScannerScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, setUser, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // Handle case where auth exists but firestore doc doesn't
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return null; // Or a splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.role === 'lecturer' ? (
            <>
              <Stack.Screen name="LecturerRoot" component={LecturerDashboard} />
              <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="StudentRoot" component={StudentDashboard} />
              <Stack.Screen name="Scanner" component={ScannerScreen} />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
