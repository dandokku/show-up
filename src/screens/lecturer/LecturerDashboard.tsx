import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { auth } from '../../api/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { useSessionStore } from '../../store/useSessionStore';

const LecturerDashboard = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { courses, fetchCourses, createCourse, startSession, isLoading } = useSessionStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!newCourseName || !newCourseCode) return;
    setCreating(true);
    try {
      await createCourse(newCourseName, newCourseCode);
      setModalVisible(false);
      setNewCourseName('');
      setNewCourseCode('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleStartSession = async (courseId: string) => {
    try {
      // In a real app, we'd check if a session is already active
      await startSession(courseId);
      // After starting, the session store will have activeSession set
      // We navigate to ActiveSessionScreen with the new session ID
      // We'll need a slight delay or a way to get the ID back from startSession
      // Let's modify startSession in useSessionStore to return the ID or just fetch it
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // We should watch for activeSession and navigate if it exists
  const { activeSession } = useSessionStore();
  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      navigation.navigate('ActiveSession', { sessionId: activeSession.id });
    }
  }, [activeSession]);

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Courses</Text>
        <Text style={styles.subtitle}>Select a course to start a session.</Text>

        {isLoading ? (
          <ActivityIndicator color="#3B82F6" size="large" style={{ marginTop: 40 }} />
        ) : courses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No courses yet.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnText}>Create Your First Course</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.courseList}>
            {courses.map((course) => (
              <View key={course.id} style={styles.courseCard}>
                <View>
                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.courseCode}>{course.code}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.startBtn} 
                  onPress={() => handleStartSession(course.id)}
                >
                  <Text style={styles.startBtnText}>Start</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.outlineAddBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.outlineAddBtnText}>+ Add New Course</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Course Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Course</Text>
            <TextInput
              style={styles.input}
              placeholder="Course Name (e.g. Mobile Dev)"
              placeholderTextColor="#94A3B8"
              value={newCourseName}
              onChangeText={setNewCourseName}
            />
            <TextInput
              style={styles.input}
              placeholder="Course Code (e.g. CS101)"
              placeholderTextColor="#94A3B8"
              value={newCourseCode}
              onChangeText={setNewCourseCode}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleCreateCourse}
                disabled={creating}
              >
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  emptyCard: {
    backgroundColor: '#1E293B',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 20,
  },
  addBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  courseList: {
    gap: 16,
    paddingBottom: 40,
  },
  courseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  courseName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  courseCode: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  startBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  outlineAddBtn: {
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  outlineAddBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default LecturerDashboard;
