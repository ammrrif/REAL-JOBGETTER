export interface AnalyzeRequestBody {
  resumeText: string;
  jobDescription: string;
  jobTitle?: string;
}

export interface SkillMatch {
  skill: string;
  found: boolean;
}

export type InterviewQuestionCategory = "Technical" | "Behavioral" | "Skill-Gap";

export interface InterviewQuestionItem {
  category: InterviewQuestionCategory;
  question: string;
}

export interface AnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  missingSkills: string[];
  weaknesses: string[];
  improvements: string[];
  certifications: string[];
  interviewQuestions: InterviewQuestionItem[];
  matchedKeywords: string[];
  keywordCoverage: {
    total: number;
    matched: number;
    percentage: number;
  };
}
