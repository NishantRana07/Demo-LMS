export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'fill-blank';
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
  };
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'exam' | 'assignment' | 'survey';
  courseId?: string; // If linked to a course
  questions: Question[];
  settings: {
    timeLimit?: number; // in minutes
    attemptsAllowed: number;
    passingScore: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResults: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  tags: string[];
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  userId: string;
  answers: { questionId: string; answer: string | string[] }[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // in minutes
  startedAt: string;
  submittedAt: string;
  attemptNumber: number;
  feedback?: string;
}

export interface CourseAssessment {
  id: string;
  courseId: string;
  assessmentId: string;
  order: number;
  isRequired: boolean;
  dueDate?: string;
  availableFrom: string;
  availableUntil?: string;
  prerequisites?: string[]; // Other assessment IDs
}

// Assessment CRUD operations
export const getAssessments = (): Assessment[] => {
  const assessments = localStorage.getItem('qedge_assessments');
  return assessments ? JSON.parse(assessments) : [];
};

export const getAssessment = (id: string): Assessment | null => {
  const assessments = getAssessments();
  return assessments.find(a => a.id === id) || null;
};

export const createAssessment = (assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Assessment => {
  const newAssessment: Assessment = {
    ...assessment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const assessments = getAssessments();
  assessments.push(newAssessment);
  localStorage.setItem('qedge_assessments', JSON.stringify(assessments));
  
  return newAssessment;
};

export const updateAssessment = (id: string, updates: Partial<Assessment>): Assessment | null => {
  const assessments = getAssessments();
  const index = assessments.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  assessments[index] = {
    ...assessments[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('qedge_assessments', JSON.stringify(assessments));
  return assessments[index];
};

export const deleteAssessment = (id: string): boolean => {
  const assessments = getAssessments();
  const filtered = assessments.filter(a => a.id !== id);
  
  if (filtered.length === assessments.length) return false;
  
  localStorage.setItem('qedge_assessments', JSON.stringify(filtered));
  return true;
};

// Course assessment linking
export const getCourseAssessments = (courseId: string): CourseAssessment[] => {
  const courseAssessments = localStorage.getItem('qedge_course_assessments');
  if (!courseAssessments) return [];
  
  const all: CourseAssessment[] = JSON.parse(courseAssessments);
  return all.filter(ca => ca.courseId === courseId).sort((a, b) => a.order - b.order);
};

export const addAssessmentToCourse = (courseAssessment: Omit<CourseAssessment, 'id'>): CourseAssessment => {
  const newCourseAssessment: CourseAssessment = {
    ...courseAssessment,
    id: Date.now().toString()
  };
  
  const courseAssessments = localStorage.getItem('qedge_course_assessments');
  const all: CourseAssessment[] = courseAssessments ? JSON.parse(courseAssessments) : [];
  all.push(newCourseAssessment);
  localStorage.setItem('qedge_course_assessments', JSON.stringify(all));
  
  return newCourseAssessment;
};

export const removeAssessmentFromCourse = (courseId: string, assessmentId: string): boolean => {
  const courseAssessments = localStorage.getItem('qedge_course_assessments');
  if (!courseAssessments) return false;
  
  const all: CourseAssessment[] = JSON.parse(courseAssessments);
  const filtered = all.filter(ca => !(ca.courseId === courseId && ca.assessmentId === assessmentId));
  
  if (filtered.length === all.length) return false;
  
  localStorage.setItem('qedge_course_assessments', JSON.stringify(filtered));
  return true;
};

// Submission handling
export const getAssessmentSubmissions = (assessmentId?: string, userId?: string): AssessmentSubmission[] => {
  const submissions = localStorage.getItem('qedge_assessment_submissions');
  if (!submissions) return [];
  
  const all: AssessmentSubmission[] = JSON.parse(submissions);
  
  if (assessmentId && userId) {
    return all.filter(s => s.assessmentId === assessmentId && s.userId === userId);
  } else if (assessmentId) {
    return all.filter(s => s.assessmentId === assessmentId);
  } else if (userId) {
    return all.filter(s => s.userId === userId);
  }
  
  return all;
};

export const submitAssessment = (submission: Omit<AssessmentSubmission, 'id' | 'submittedAt'>): AssessmentSubmission => {
  const newSubmission: AssessmentSubmission = {
    ...submission,
    id: Date.now().toString(),
    submittedAt: new Date().toISOString()
  };
  
  const submissions = localStorage.getItem('qedge_assessment_submissions');
  const all: AssessmentSubmission[] = submissions ? JSON.parse(submissions) : [];
  all.push(newSubmission);
  localStorage.setItem('qedge_assessment_submissions', JSON.stringify(all));
  
  return newSubmission;
};

// Analytics and stats
export const getAssessmentStats = (assessmentId: string) => {
  const submissions = getAssessmentSubmissions(assessmentId);
  const assessment = getAssessment(assessmentId);
  
  if (!assessment || submissions.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      passRate: 0,
      averageTime: 0,
      scoreDistribution: []
    };
  }
  
  const scores = submissions.map(s => s.percentage);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const passCount = submissions.filter(s => s.passed).length;
  const passRate = (passCount / submissions.length) * 100;
  const averageTime = submissions.reduce((sum, s) => sum + s.timeSpent, 0) / submissions.length;
  
  // Score distribution
  const scoreRanges = [
    { range: '0-59', count: 0 },
    { range: '60-69', count: 0 },
    { range: '70-79', count: 0 },
    { range: '80-89', count: 0 },
    { range: '90-100', count: 0 }
  ];
  
  scores.forEach(score => {
    if (score < 60) scoreRanges[0].count++;
    else if (score < 70) scoreRanges[1].count++;
    else if (score < 80) scoreRanges[2].count++;
    else if (score < 90) scoreRanges[3].count++;
    else scoreRanges[4].count++;
  });
  
  return {
    totalSubmissions: submissions.length,
    averageScore: Math.round(averageScore),
    passRate: Math.round(passRate),
    averageTime: Math.round(averageTime),
    scoreDistribution: scoreRanges
  };
};

export const getUserAssessmentStats = (userId: string) => {
  const submissions = getAssessmentSubmissions(undefined, userId);
  
  const totalAssessments = submissions.length;
  const averageScore = totalAssessments > 0 
    ? Math.round(submissions.reduce((sum, s) => sum + s.percentage, 0) / totalAssessments)
    : 0;
  const passedAssessments = submissions.filter(s => s.passed).length;
  const passRate = totalAssessments > 0 ? Math.round((passedAssessments / totalAssessments) * 100) : 0;
  
  return {
    totalAssessments,
    averageScore,
    passRate,
    passedAssessments,
    totalTime: submissions.reduce((sum, s) => sum + s.timeSpent, 0)
  };
};
