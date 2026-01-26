export interface CourseProgress {
  courseId: string;
  userId: string;
  completedLessons: string[];
  currentLesson: string;
  overallProgress: number;
  timeSpent: number; // in minutes
  lastAccessed: string;
  quizScores: { lessonId: string; score: number; maxScore: number }[];
  notes: { lessonId: string; content: string; timestamp: string }[];
}

export interface MeetingRecording {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  recordingUrl: string;
  duration: number; // in minutes
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  views: number;
  tags: string[];
  isPublic: boolean;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  timeSpent: number;
  score?: number;
  completedAt?: string;
}

// Progress tracking functions
export const getCourseProgress = (courseId: string, userId: string): CourseProgress | null => {
  const progressData = localStorage.getItem('qedge_course_progress');
  if (!progressData) return null;
  
  const allProgress: CourseProgress[] = JSON.parse(progressData);
  return allProgress.find(p => p.courseId === courseId && p.userId === userId) || null;
};

export const updateCourseProgress = (progress: CourseProgress): void => {
  const progressData = localStorage.getItem('qedge_course_progress');
  const allProgress: CourseProgress[] = progressData ? JSON.parse(progressData) : [];
  
  const existingIndex = allProgress.findIndex(p => p.courseId === progress.courseId && p.userId === progress.userId);
  
  if (existingIndex >= 0) {
    allProgress[existingIndex] = progress;
  } else {
    allProgress.push(progress);
  }
  
  localStorage.setItem('qedge_course_progress', JSON.stringify(allProgress));
};

export const markLessonComplete = (courseId: string, userId: string, lessonId: string): CourseProgress => {
  const progress = getCourseProgress(courseId, userId) || {
    courseId,
    userId,
    completedLessons: [],
    currentLesson: lessonId,
    overallProgress: 0,
    timeSpent: 0,
    lastAccessed: new Date().toISOString(),
    quizScores: [],
    notes: []
  };
  
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  }
  
  progress.currentLesson = lessonId;
  progress.lastAccessed = new Date().toISOString();
  
  // Calculate overall progress (this would be based on total lessons in the course)
  const courses = JSON.parse(localStorage.getItem('qedge_courses') || '[]');
  const course = courses.find((c: any) => c.id === courseId);
  if (course && course.lessons) {
    progress.overallProgress = Math.round((progress.completedLessons.length / course.lessons.length) * 100);
  }
  
  updateCourseProgress(progress);
  return progress;
};

// Meeting recordings functions
export const getMeetingRecordings = (meetingId?: string): MeetingRecording[] => {
  const recordingsData = localStorage.getItem('qedge_meeting_recordings');
  if (!recordingsData) return [];
  
  const allRecordings: MeetingRecording[] = JSON.parse(recordingsData);
  
  if (meetingId) {
    return allRecordings.filter(r => r.meetingId === meetingId);
  }
  
  return allRecordings;
};

export const addMeetingRecording = (recording: Omit<MeetingRecording, 'id' | 'uploadedAt' | 'views'>): MeetingRecording => {
  const newRecording: MeetingRecording = {
    ...recording,
    id: Date.now().toString(),
    uploadedAt: new Date().toISOString(),
    views: 0
  };
  
  const recordingsData = localStorage.getItem('qedge_meeting_recordings');
  const allRecordings: MeetingRecording[] = recordingsData ? JSON.parse(recordingsData) : [];
  
  allRecordings.push(newRecording);
  localStorage.setItem('qedge_meeting_recordings', JSON.stringify(allRecordings));
  
  return newRecording;
};

export const incrementRecordingViews = (recordingId: string): void => {
  const recordingsData = localStorage.getItem('qedge_meeting_recordings');
  if (!recordingsData) return;
  
  const allRecordings: MeetingRecording[] = JSON.parse(recordingsData);
  const recording = allRecordings.find(r => r.id === recordingId);
  
  if (recording) {
    recording.views++;
    localStorage.setItem('qedge_meeting_recordings', JSON.stringify(allRecordings));
  }
};

export const getUserProgressStats = (userId: string) => {
  const progressData = localStorage.getItem('qedge_course_progress');
  if (!progressData) return { totalCourses: 0, completedCourses: 0, totalTime: 0, averageProgress: 0 };
  
  const userProgress: CourseProgress[] = JSON.parse(progressData).filter((p: CourseProgress) => p.userId === userId);
  
  const completedCourses = userProgress.filter(p => p.overallProgress === 100).length;
  const totalTime = userProgress.reduce((sum, p) => sum + p.timeSpent, 0);
  const averageProgress = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum, p) => sum + p.overallProgress, 0) / userProgress.length)
    : 0;
  
  return {
    totalCourses: userProgress.length,
    completedCourses,
    totalTime,
    averageProgress
  };
};
