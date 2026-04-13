
import { Quiz, User, Attempt, Violation } from './types';
import { supabase } from './supabase';

const KEYS = {
  CURRENT_USER: 'quiz_portal_current_user',
};

export const Storage = {
  getQuizzes: async (): Promise<Quiz[]> => {
    const { data, error } = await supabase.from('quizzes').select('*, questions(*)');
    if (error) { console.error(error); return []; }
    return data.map(q => ({
      ...q,
      durationMinutes: q.duration_minutes,
      academicYear: q.academic_year,
      adminId: q.admin_id,
      createdAt: q.created_at,
    })) as Quiz[];
  },
  saveQuiz: async (quiz: Quiz) => {
    const { questions, ...quizData } = quiz;
    const { data: savedQuiz, error } = await supabase.from('quizzes').upsert({
      id: quizData.id,
      title: quizData.title,
      subject: quizData.subject,
      description: quizData.description,
      academic_year: quizData.academicYear,
      semester: quizData.semester,
      duration_minutes: quizData.durationMinutes,
      created_at: quizData.createdAt,
      admin_id: quizData.adminId,
      active: quizData.active,
      status: quizData.status
    }).select().single();
    
    if (error) { 
      console.error(error); 
      throw new Error(error.message); 
    }

    if (questions && questions.length > 0) {
      const questionsToSave = questions.map(q => ({
        id: q.id,
        quiz_id: savedQuiz.id,
        text: q.text,
        options: q.options,
        correct_answer: q.correctAnswer,
        difficulty: q.difficulty,
        explanation: q.explanation
      }));
      const { error: qError } = await supabase.from('questions').upsert(questionsToSave);
      if (qError) {
        console.error(qError);
        throw new Error(qError.message);
      }
    }
  },
  deleteQuiz: async (id: string) => {
    await supabase.from('quizzes').delete().eq('id', id);
  },

  getAttempts: async (): Promise<Attempt[]> => {
    const { data, error } = await supabase.from('attempts').select('*');
    if (error) { console.error(error); return []; }
    return data.map(a => ({
      ...a,
      quizId: a.quiz_id,
      studentId: a.student_id,
      totalQuestions: a.total_questions,
      timeTaken: a.time_taken,
    })) as Attempt[];
  },
  saveAttempt: async (attempt: Attempt) => {
    await supabase.from('attempts').insert({
      id: attempt.id,
      quiz_id: attempt.quizId,
      student_id: attempt.studentId,
      score: attempt.score,
      total_questions: attempt.totalQuestions,
      time_taken: attempt.timeTaken,
      timestamp: attempt.timestamp,
      answers: attempt.answers
    });
  },

  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) { console.error(error); return []; }
    return data.map(u => ({
      ...u,
      academicYear: u.academic_year,
      rollNumber: u.roll_number,
      isBlocked: u.is_blocked,
      blockedUntil: u.blocked_until,
      warningCount: u.warning_count,
      isArchived: u.is_archived
    })) as User[];
  },
  saveUser: async (user: User) => {
    const { data, error } = await supabase.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      academic_year: user.academicYear,
      semester: user.semester,
      roll_number: user.rollNumber,
      password: user.password,
      is_blocked: user.isBlocked,
      blocked_until: user.blockedUntil,
      warning_count: user.warningCount,
      is_archived: user.isArchived
    }).select().single();
    
    if (error) { console.error(error); return; }

    const currentUser = Storage.getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
      Storage.setCurrentUser({
        ...data,
        academicYear: data.academic_year,
        rollNumber: data.roll_number,
        isBlocked: data.is_blocked,
        blockedUntil: data.blocked_until,
        warningCount: data.warning_count,
        isArchived: data.is_archived
      });
    }
  },

  getCurrentUser: (): User | null => {
    const user = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || 'null');
    if (user && user.isBlocked && user.blockedUntil && Date.now() > user.blockedUntil) {
      const updatedUser = { ...user, isBlocked: false, warningCount: 0 };
      // Fire and forget the async saveUser, but update local storage immediately
      Storage.saveUser(updatedUser).catch(console.error);
      Storage.setCurrentUser(updatedUser);
      return updatedUser;
    }
    return user;
  },
  setCurrentUser: (user: User | null) => localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user)),

  getViolations: async (): Promise<Violation[]> => {
    const { data, error } = await supabase.from('violations').select('*');
    if (error) { console.error(error); return []; }
    return data.map(v => ({
      ...v,
      studentId: v.student_id,
      quizId: v.quiz_id
    })) as Violation[];
  },
  saveViolation: async (violation: Violation) => {
    await supabase.from('violations').insert({
      id: violation.id,
      student_id: violation.studentId,
      quiz_id: violation.quizId,
      type: violation.type,
      timestamp: violation.timestamp,
      description: violation.description
    });
    
    // Update user warning count
    const { data: user } = await supabase.from('users').select('*').eq('id', violation.studentId).single();
    if (user) {
      const newCount = (user.warning_count || 0) + 1;
      const updates: any = { warning_count: newCount };
      
      if (newCount >= 3) {
        updates.is_blocked = true;
        updates.blocked_until = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      }
      
      await supabase.from('users').update(updates).eq('id', violation.studentId);
    }
  },
  
  deleteUser: async (userId: string) => {
    await supabase.from('users').delete().eq('id', userId);
    // Also clean up related data if necessary
    await supabase.from('attempts').delete().eq('student_id', userId);
    await supabase.from('violations').delete().eq('student_id', userId);
  },

  unblockUser: async (userId: string) => {
    await supabase.from('users').update({
      is_blocked: false,
      warning_count: 0,
      blocked_until: null
    }).eq('id', userId);
  },

  getSystemConfig: async (key: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', key)
      .single();
    if (error) {
      console.warn(`Config key ${key} not found in Supabase`, error.message);
      return null;
    }
    return data?.value || null;
  },

  clearAll: () => localStorage.clear()
};
