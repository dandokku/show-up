import { create } from 'zustand';
import { db, auth } from '../api/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { Course, Session } from '../types';

interface SessionState {
  courses: Course[];
  activeSession: Session | null;
  isLoading: boolean;
  fetchCourses: () => Promise<void>;
  createCourse: (name: string, code: string) => Promise<void>;
  startSession: (courseId: string) => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
  listenToActiveSession: (sessionId: string) => () => void;
  updateSessionToken: (sessionId: string, newToken: string) => Promise<void>;
  checkIn: (sessionId: string, token: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  courses: [],
  activeSession: null,
  isLoading: false,

  fetchCourses: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    set({ isLoading: true });
    try {
      const q = query(collection(db, 'courses'), where('lecturerId', '==', userId));
      const querySnapshot = await getDocs(q);
      const courses: Course[] = [];
      querySnapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() } as Course);
      });
      set({ courses });
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createCourse: async (name, code) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        name,
        code,
        lecturerId: userId,
      });
      const newCourse: Course = { id: docRef.id, name, code, lecturerId: userId };
      set((state) => ({ courses: [...state.courses, newCourse] }));
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  startSession: async (courseId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      // Generate initial token
      const initialToken = Math.random().toString(36).substring(2, 8).toUpperCase();

      const docRef = await addDoc(collection(db, 'sessions'), {
        courseId,
        lecturerId: userId,
        status: 'active',
        activeToken: initialToken,
        tokenGeneratedAt: serverTimestamp(),
        startTime: serverTimestamp(),
        endTime: null,
      });

      // We'll set the active session locally, but listenToActiveSession will keep it synced
      set({
        activeSession: {
          id: docRef.id,
          courseId,
          lecturerId: userId,
          status: 'active',
          activeToken: initialToken,
          tokenGeneratedAt: new Date(),
          startTime: new Date(),
          endTime: null,
        },
      });
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  },

  endSession: async (sessionId) => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'ended',
        endTime: serverTimestamp(),
      });
      set({ activeSession: null });
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },

  listenToActiveSession: (sessionId) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        set({ activeSession: { id: doc.id, ...doc.data() } as Session });
      } else {
        set({ activeSession: null });
      }
    });
    return unsubscribe;
  },

  updateSessionToken: async (sessionId, newToken) => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        activeToken: newToken,
        tokenGeneratedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating token:', error);
    }
  },

  checkIn: async (sessionId: string, token: string) => {
    const userId = auth.currentUser?.uid;
    const userName = auth.currentUser?.displayName || 'Unknown Student';
    if (!userId) return;

    try {
      // 1. Get the session doc to verify token
      const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
      if (!sessionDoc.exists()) throw new Error('Session not found');
      
      const sessionData = sessionDoc.data() as Session;
      if (sessionData.status !== 'active') throw new Error('Session has ended');
      
      // Basic token check (can be improved with timestamp validation)
      if (sessionData.activeToken !== token) {
        throw new Error('Invalid or expired token. Please scan again.');
      }

      // 2. Add/Update attendance record
      const attendanceId = `${sessionId}_${userId}`;
      const attendanceRef = doc(db, 'attendance', attendanceId);
      const attendanceDoc = await getDoc(attendanceRef);

      const checkIn = {
        timestamp: new Date(),
        tokenMatched: token,
      };

      if (attendanceDoc.exists()) {
        // Append to existing check-ins
        const data = attendanceDoc.data();
        await updateDoc(attendanceRef, {
          checkIns: [...data.checkIns, checkIn],
          status: 'verified', // Reset flag if it was flagged? Or keep it?
          lastCheckIn: serverTimestamp(),
        });
      } else {
        // Create new record
        await setDoc(attendanceRef, {
          sessionId,
          studentId: userId,
          studentName: userName,
          status: 'verified',
          checkIns: [checkIn],
          missedWindows: 0,
          createdAt: serverTimestamp(),
          lastCheckIn: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  }
}));
