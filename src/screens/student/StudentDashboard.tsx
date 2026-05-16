import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { auth } from '../../api/firebase';
import { useAuthStore } from '../../store/useAuthStore';

const StudentDashboard = ({ navigation }: any) => {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.name}>{user?.displayName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => auth.signOut()}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Student Portal</Text>
        <Text style={styles.subtitle}>Verify your attendance for today's classes.</Text>
        
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📸</Text>
          </View>
          <Text style={styles.cardTitle}>Live Check-in</Text>
          <Text style={styles.cardDesc}>
            Scanning the QR code periodically will keep your attendance verified throughout the lecture.
          </Text>
          <TouchableOpacity 
            style={styles.scanBtn} 
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={styles.scanBtnText}>Open QR Scanner</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Total Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  welcome: {
    color: '#94A3B8',
    fontSize: 14,
  },
  name: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDesc: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  scanBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNum: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StudentDashboard;
