export interface AnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  missingSkills: string[];
  weaknesses: string[];
  improvements: string[];
  certifications: string[];
  interviewQuestions: string[];
  matchedKeywords: string[];
  keywordCoverage: {
    total: number;
    matched: number;
    percentage: number;
  };
}

export interface UploadedResume {
  fileName: string;
  text: string;
}
