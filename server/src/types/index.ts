export interface AnalyzeRequestBody {
  resumeText: string;
  jobDescription: string;
  jobTitle?: string;
}

export interface SkillMatch {
  skill: string;
  found: boolean;
}

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
