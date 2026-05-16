export type UserRole = 'lecturer' | 'student';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  deviceId: string;
  createdAt: any; // Firestore Timestamp
}

export interface Course {
  id: string;
  name: string;
  code: string;
  lecturerId: string;
}

export interface Session {
  id: string;
  courseId: string;
  lecturerId: string;
  status: 'active' | 'ended';
  activeToken: string;
  tokenGeneratedAt: any; // Firestore Timestamp
  startTime: any; // Firestore Timestamp
  endTime: any | null;
}

export interface Attendance {
  id: string; // sessionId_studentId
  sessionId: string;
  studentId: string;
  studentName: string;
  checkIns: CheckIn[];
  status: 'verified' | 'flagged' | 'absent';
  missedWindows: number;
}

export interface CheckIn {
  timestamp: any; // Firestore Timestamp
  tokenMatched: string;
}
