import React, { createContext, useContext, useState, ReactNode } from "react";
import { QuestionInterface } from "@/types/questions";

interface QuestionsContextType {
  questions: QuestionInterface[];
  addQuestion: (question: QuestionInterface[]) => void;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(
  undefined
);

export const QuestionsProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<QuestionInterface[]>([]);

  const addQuestion = (question: QuestionInterface[]) => {
    setQuestions(question);
  };

  return (
    <QuestionsContext.Provider value={{ questions, addQuestion }}>
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = (): QuestionsContextType => {
  const context = useContext(QuestionsContext);
  if (!context) {
    throw new Error("useQuestions must be used within a QuestionsProvider");
  }
  return context;
};
