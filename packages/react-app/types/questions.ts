export interface QuestionInterface {
  question: string;
  options: string[];
  answer: string;
}

export interface TriviaInterface {
  walletAddress: string;
  triviaName: string;
  questions: QuestionInterface[];
}
