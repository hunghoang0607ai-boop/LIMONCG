import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Exam, ExamAttempt } from '@appTypes/index';

interface ExamState {
  currentExam: Exam | null;
  currentAttempt: ExamAttempt | null;
  exams: Exam[];
  isLoading: boolean;
}

const initialState: ExamState = {
  currentExam: null,
  currentAttempt: null,
  exams: [],
  isLoading: false,
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    setCurrentExam: (state, action: PayloadAction<Exam | null>) => {
      state.currentExam = action.payload;
    },
    setCurrentAttempt: (state, action: PayloadAction<ExamAttempt | null>) => {
      state.currentAttempt = action.payload;
    },
    setExams: (state, action: PayloadAction<Exam[]>) => {
      state.exams = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearExamState: (state) => {
      state.currentExam = null;
      state.currentAttempt = null;
    },
  },
});

export const { setCurrentExam, setCurrentAttempt, setExams, setLoading, clearExamState } =
  examSlice.actions;
export default examSlice.reducer;
