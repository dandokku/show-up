import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSessionStore } from '../../store/useSessionStore';
import { db } from '../../api/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Attendance } from '../../types';

const ActiveSessionScreen = ({ route, navigation }: any) => {
  const { sessionId } = route.params;
  const { activeSession, endSession, listenToActiveSession, updateSessionToken } = useSessionStore();
  const [countdown, setCountdown] = useState(30); // 30 seconds rotation
  const [attendees, setAttendees] = useState<Attendance[]>([]);

  // Listen to active session changes
  useEffect(() => {
    const unsubscribe = listenToActiveSession(sessionId);
    return () => unsubscribe();
  }, [sessionId]);

  // Listen to attendance updates in real-time
  useEffect(() => {
    const q = query(collection(db, 'attendance'), where('sessionId', '==', sessionId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Attendance[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Attendance);
      });
      setAttendees(list);
    });
    return () => unsubscribe();
  }, [sessionId]);

  // Token Rotation logic (Client-side for MVP, ideally Cloud Function)
  useEffect(() => {
    if (!activeSession || activeSession.status === 'ended') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Generate new token
          const newToken = Math.random().toString(36).substring(2, 8).toUpperCase();
          updateSessionToken(sessionId, newToken);
          return 30; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, sessionId]);

  const handleEndSession = async () => {
    await endSession(sessionId);
    navigation.goBack();
  };

  if (!activeSession) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Session...</Text>
      </View>
    );
  }

  // QR Code payload contains both sessionId and activeToken
  const qrPayload = JSON.stringify({
    sessionId: activeSession.id,
    token: activeSession.activeToken,
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Live Session</Text>
      <Text style={styles.subtitle}>Students must scan the QR code to verify attendance.</Text>

      <View style={styles.qrContainer}>
        <View style={styles.qrCard}>
          <QRCode
            value={qrPayload}
            size={220}
            color="#0F172A"
            backgroundColor="#FFFFFF"
          />
        </View>
        <Text style={styles.codeText}>{activeSession.activeToken}</Text>
        <Text style={styles.timerText}>Rotates in: <Text style={styles.timerHighlight}>{countdown}s</Text></Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{attendees.length}</Text>
          <Text style={styles.statLbl}>Present</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: '#EF4444' }]}>
            {attendees.filter(a => a.status === 'flagged').length}
          </Text>
          <Text style={styles.statLbl}>Flagged</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Check-ins</Text>
      {attendees.length === 0 ? (
        <Text style={styles.emptyText}>Waiting for students to check in...</Text>
      ) : (
        <View style={styles.list}>
          {attendees.map((attendee) => (
            <View key={attendee.id} style={styles.attendeeRow}>
              <Text style={styles.attendeeName}>{attendee.studentName}</Text>
              <View style={[
                styles.badge, 
                attendee.status === 'verified' ? styles.badgeVerified : styles.badgeFlagged
              ]}>
                <Text style={styles.badgeText}>{attendee.status}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.endBtn} onPress={handleEndSession}>
        <Text style={styles.endBtnText}>End Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 32,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 4,
    marginBottom: 8,
  },
  timerText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  timerHighlight: {
    color: '#EF4444',
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  statLbl: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  list: {
    gap: 12,
    marginBottom: 32,
  },
  attendeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  attendeeName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeVerified: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeFlagged: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  badgeText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  endBtn: {
    backgroundColor: '#EF4444',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  endBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ActiveSessionScreen;
