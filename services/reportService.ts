import * as XLSX from 'xlsx';
import { Quiz, Attempt, User } from '../types';

export const ReportService = {
  generateStudentReport: (student: User, quiz: Quiz, attempt: Attempt) => {
    const wb = XLSX.utils.book_new();
    
    // 1. Summary Sheet
    const summaryData = [
      ['STUDENT INFORMATION'],
      ['Name', student.name],
      ['Roll Number / ID', student.rollNumber || 'N/A'],
      ['Email', student.email],
      [],
      ['EXAM INFORMATION'],
      ['Exam Title', quiz.title],
      ['Date of Attempt', new Date(attempt.timestamp).toLocaleString()],
      ['Total Questions', quiz.questions.length],
      ['Allowed Duration', `${quiz.durationMinutes} Minutes`],
      ['Time Taken', `${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s`],
      [],
      ['PERFORMANCE SUMMARY'],
      ['Marks Obtained', attempt.score],
      ['Maximum Marks', attempt.totalQuestions],
      ['Percentage Score', `${Math.round((attempt.score / attempt.totalQuestions) * 100)}%`],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // 2. Question Details Sheet
    const questionHeaders = ['Q#', 'Question Text', 'Selected Answer', 'Correct Answer', 'Status'];
    const questionRows = quiz.questions.map((q, idx) => {
      const selectedIdx = attempt.answers[q.id];
      const selectedAnswer = selectedIdx !== undefined ? q.options[selectedIdx] : 'N/A';
      const correctAnswer = q.options[q.correctAnswer];
      const status = selectedIdx !== undefined ? 'Attempted' : 'Not Attempted';
      
      return [
        idx + 1,
        q.text,
        selectedAnswer,
        correctAnswer,
        status
      ];
    });

    const wsDetails = XLSX.utils.aoa_to_sheet([questionHeaders, ...questionRows]);
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Question Details');

    // Generate and download
    const fileName = `Exam_Report_${student.name.replace(/\s+/g, '_')}_${quiz.title.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  generateExamReport: (quiz: Quiz, attempts: Attempt[], students: User[]) => {
    const wb = XLSX.utils.book_new();
    
    // 1. Overview Sheet
    const overviewData = [
      ['EXAM OVERVIEW REPORT'],
      ['Exam Title', quiz.title],
      ['Academic Year', quiz.academicYear],
      ['Semester', quiz.semester],
      ['Total Questions', quiz.questions.length],
      ['Duration', `${quiz.durationMinutes} Mins`],
      ['Total Submissions', attempts.length],
      ['Average Score', attempts.length > 0 
        ? `${(attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / attempts.length * 100).toFixed(1)}%`
        : '0%'
      ],
      ['Generated At', new Date().toLocaleString()],
    ];
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

    // 2. Student Performance List
    const performanceHeaders = ['Student Name', 'Roll Number', 'Score', 'Total', 'Percentage', 'Time Taken', 'Date'];
    const performanceRows = attempts.map(attempt => {
      const student = students.find(s => s.id === attempt.studentId);
      return [
        student?.name || 'Unknown',
        student?.rollNumber || 'N/A',
        attempt.score,
        attempt.totalQuestions,
        `${Math.round((attempt.score / attempt.totalQuestions) * 100)}%`,
        `${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s`,
        new Date(attempt.timestamp).toLocaleDateString()
      ];
    });
    const wsPerformance = XLSX.utils.aoa_to_sheet([performanceHeaders, ...performanceRows]);
    XLSX.utils.book_append_sheet(wb, wsPerformance, 'Student Performance');

    const fileName = `Exam_Report_${quiz.title.replace(/\s+/g, '_')}_Full.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  generateAdvancedReport: (
    quizzes: Quiz[],
    attempts: Attempt[],
    students: User[],
    filters: {
      academicYear?: string;
      semester?: string;
      quizId?: string;
      studentId?: string;
    }
  ) => {
    const wb = XLSX.utils.book_new();
    
    // Group data by Year and Semester
    const groupedData: Record<string, any[]> = {};

    attempts.forEach(attempt => {
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      const student = students.find(s => s.id === attempt.studentId);
      
      if (!quiz || !student) return;

      // Apply filters
      if (filters.academicYear && filters.academicYear !== 'All Years' && quiz.academicYear !== filters.academicYear) return;
      if (filters.semester && filters.semester !== 'All Semesters' && quiz.semester !== filters.semester) return;
      if (filters.quizId && filters.quizId !== 'All Exams' && quiz.id !== filters.quizId) return;
      if (filters.studentId && filters.studentId !== 'All Students' && student.id !== filters.studentId) return;

      const sheetName = `${quiz.academicYear} - ${quiz.semester}`.substring(0, 31); // Excel sheet name limit
      
      if (!groupedData[sheetName]) {
        groupedData[sheetName] = [[
          'Roll Number', 'Student Name', 'Academic Year', 'Semester', 'Exam Title', 'Exam Date', 
          'Marks', 'Total Questions', 'Percentage', 
          'Time Taken', 'Attempted', 'Unattempted'
        ]];
      }

      const attemptedCount = Object.keys(attempt.answers).length;
      const unattemptedCount = quiz.questions.length - attemptedCount;

      groupedData[sheetName].push([
        student.rollNumber || 'N/A',
        student.name,
        quiz.academicYear,
        quiz.semester,
        quiz.title,
        new Date(attempt.timestamp).toLocaleDateString(),
        attempt.score,
        attempt.totalQuestions,
        `${Math.round((attempt.score / attempt.totalQuestions) * 100)}%`,
        `${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s`,
        attemptedCount,
        unattemptedCount
      ]);
    });

    // Create sheets
    Object.keys(groupedData).sort().forEach(sheetName => {
      const ws = XLSX.utils.aoa_to_sheet(groupedData[sheetName]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    if (Object.keys(groupedData).length === 0) {
      alert("No data found for the selected filters.");
      return;
    }

    const yearStr = filters.academicYear && filters.academicYear !== 'All Years' ? filters.academicYear.replace(/\s+/g, '_') : 'All_Years';
    const semStr = filters.semester && filters.semester !== 'All Semesters' ? filters.semester.replace(/\s+/g, '_') : 'All_Semesters';
    const dateStr = new Date().toISOString().split('T')[0];
    
    const fileName = `Exam_Report_${yearStr}_${semStr}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
};
