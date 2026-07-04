import { AnalysisResult } from "../types";

// A broad skills dictionary spanning common tech + business domains.
// Keyword-based matching against this list is what drives the "intelligence"
// of the mock analysis (score, strengths, gaps) without calling a real model.
const SKILL_DICTIONARY: string[] = [
  // Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang", "rust", "php", "ruby", "swift", "kotlin", "sql",
  // Frontend
  "react", "vue", "angular", "next.js", "nextjs", "redux", "html", "css", "tailwind", "sass", "webpack", "vite", "figma",
  // Backend
  "node.js", "nodejs", "express", "django", "flask", "spring", "graphql", "rest api", "microservices", "grpc",
  // Data / AI
  "machine learning", "deep learning", "pytorch", "tensorflow", "pandas", "numpy", "data analysis", "data science",
  "nlp", "computer vision", "sql", "etl", "airflow", "spark", "hadoop", "power bi", "tableau",
  // Cloud / DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "jenkins", "github actions", "linux", "nginx",
  // Databases
  "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb", "firebase",
  // Product / Soft skills
  "agile", "scrum", "project management", "communication", "leadership", "stakeholder management",
  "problem solving", "team collaboration", "presentation", "negotiation", "mentoring",
  // Marketing / Business
  "seo", "sem", "google analytics", "content strategy", "social media marketing", "salesforce",
  "crm", "excel", "financial modeling", "budgeting", "forecasting", "market research",
  // Design
  "ui/ux", "user research", "prototyping", "adobe xd", "sketch", "wireframing",
  // General engineering practice
  "unit testing", "test driven development", "code review", "system design", "api design", "security best practices",
];

const CERTIFICATION_LIBRARY: Record<string, string[]> = {
  aws: ["AWS Certified Solutions Architect – Associate", "AWS Certified Developer – Associate"],
  azure: ["Microsoft Certified: Azure Fundamentals (AZ-900)", "Microsoft Certified: Azure Developer Associate"],
  gcp: ["Google Cloud Professional Cloud Architect"],
  "machine learning": ["DeepLearning.AI Machine Learning Specialization", "TensorFlow Developer Certificate"],
  "data science": ["IBM Data Science Professional Certificate", "Google Data Analytics Professional Certificate"],
  docker: ["Docker Certified Associate"],
  kubernetes: ["Certified Kubernetes Application Developer (CKAD)"],
  scrum: ["Certified ScrumMaster (CSM)", "PMI Agile Certified Practitioner (PMI-ACP)"],
  "project management": ["Project Management Professional (PMP)"],
  security: ["CompTIA Security+", "Certified Information Systems Security Professional (CISSP)"],
  salesforce: ["Salesforce Certified Administrator"],
  seo: ["Google Analytics Individual Qualification (GAIQ)", "HubSpot SEO Certification"],
  react: ["Meta Front-End Developer Professional Certificate"],
  "ui/ux": ["Google UX Design Professional Certificate"],
  sql: ["Microsoft Certified: Azure Data Fundamentals"],
};

const GENERIC_CERTIFICATIONS = [
  "Relevant industry certification aligned with the target role",
  "LinkedIn Learning course covering the top missing skill areas",
];

const INTERVIEW_QUESTION_BANK = {
  behavioral: [
    "Tell me about a time you had to learn a new tool or technology quickly to deliver a project.",
    "Describe a situation where you disagreed with a teammate or manager. How did you resolve it?",
    "Walk me through a project you're most proud of and the impact it had.",
    "Tell me about a time you missed a deadline or made a mistake. What did you learn?",
    "Describe how you prioritize tasks when working on multiple projects at once.",
  ],
  roleSpecificTemplate: (skill: string) =>
    `Can you describe your hands-on experience with ${skill} and a specific problem you solved using it?`,
  gapTemplate: (skill: string) =>
    `This role requires ${skill}, which isn't prominent in your background — how would you ramp up on it quickly?`,
  closing: [
    "Where do you see yourself professionally in the next 2-3 years?",
    "What interests you most about this specific role and our company?",
    "Do you have any questions for us about the team or the role?",
  ],
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9+#./\s]/g, " ");
}

function findSkillsInText(text: string): string[] {
  const normalized = normalize(text);
  return SKILL_DICTIONARY.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i");
    return pattern.test(normalized);
  });
}

function pickCertifications(missingSkills: string[]): string[] {
  const certs = new Set<string>();
  for (const skill of missingSkills) {
    const key = skill.toLowerCase();
    if (CERTIFICATION_LIBRARY[key]) {
      CERTIFICATION_LIBRARY[key].forEach((c) => certs.add(c));
    }
    if (certs.size >= 5) break;
  }
  if (certs.size === 0) {
    GENERIC_CERTIFICATIONS.forEach((c) => certs.add(c));
  }
  return Array.from(certs).slice(0, 5);
}

function buildInterviewQuestions(strengths: string[], missingSkills: string[]): string[] {
  const questions: string[] = [];

  // Lead with 2-3 behavioral questions
  questions.push(...INTERVIEW_QUESTION_BANK.behavioral.slice(0, 3));

  // Add role-specific questions built from the candidate's top matched strengths
  strengths.slice(0, 3).forEach((skill) => {
    questions.push(INTERVIEW_QUESTION_BANK.roleSpecificTemplate(skill));
  });

  // Add gap-probing questions from missing skills
  missingSkills.slice(0, 3).forEach((skill) => {
    questions.push(INTERVIEW_QUESTION_BANK.gapTemplate(skill));
  });

  // Close out with 1-2 closing questions
  questions.push(...INTERVIEW_QUESTION_BANK.closing.slice(0, 2));

  return questions.slice(0, 10);
}

function computeScore(matchedCount: number, requiredCount: number, resumeLength: number): number {
  if (requiredCount === 0) {
    return 60;
  }
  const coverage = matchedCount / requiredCount;
  let score = Math.round(coverage * 80);

  // Small bonus for a well-developed resume (more context = more confidence),
  // capped so a long resume alone can't fake a high score.
  const lengthBonus = Math.min(10, Math.floor(resumeLength / 400));
  score += lengthBonus;

  // Baseline floor so the UI never shows a discouraging near-zero score.
  score = Math.max(18, Math.min(98, score));
  return score;
}

function buildStrengths(matchedSkills: string[], resumeText: string): string[] {
  const strengths: string[] = [];

  matchedSkills.slice(0, 6).forEach((skill) => {
    strengths.push(`Demonstrated experience with ${skill}, directly relevant to this role`);
  });

  if (/\d+%|\$\d|\d+x|increased|reduced|improved|grew|saved/i.test(resumeText)) {
    strengths.push("Resume includes quantifiable achievements, which strengthens credibility with recruiters");
  }

  if (/lead|led|managed|mentored|supervised/i.test(resumeText)) {
    strengths.push("Shows leadership or mentorship experience, a strong differentiator for senior roles");
  }

  if (strengths.length === 0) {
    strengths.push("Resume is readable and clearly structured, providing a solid base to build on");
  }

  return strengths.slice(0, 8);
}

function buildWeaknesses(missingSkills: string[], resumeText: string, matchPercentage: number): string[] {
  const weaknesses: string[] = [];

  if (missingSkills.length > 0) {
    weaknesses.push(
      `Missing ${missingSkills.length} keyword${missingSkills.length > 1 ? "s" : ""} the job description emphasizes: ${missingSkills
        .slice(0, 5)
        .join(", ")}`
    );
  }

  if (!/\d+%|\$\d|\d+x|increased|reduced|improved|grew|saved/i.test(resumeText)) {
    weaknesses.push("Lacks quantifiable metrics (numbers, percentages, dollar amounts) to prove impact");
  }

  if (resumeText.trim().split(/\s+/).length < 150) {
    weaknesses.push("Resume content is relatively thin — consider adding more detail on responsibilities and outcomes");
  }

  if (matchPercentage < 40) {
    weaknesses.push("Overall keyword overlap with the job description is low, which may hurt ATS screening");
  }

  if (weaknesses.length === 0) {
    weaknesses.push("No major gaps detected — focus on tailoring language to match this specific posting");
  }

  return weaknesses.slice(0, 6);
}

function buildImprovements(missingSkills: string[], weaknesses: string[]): string[] {
  const improvements: string[] = [];

  if (missingSkills.length > 0) {
    improvements.push(
      `Add specific examples or projects that demonstrate ${missingSkills.slice(0, 3).join(", ")} if you have exposure to them`
    );
  }

  improvements.push("Quantify achievements with numbers (e.g., % improvement, revenue impact, time saved)");
  improvements.push("Mirror key phrases from the job description to improve ATS keyword matching");
  improvements.push("Trim unrelated experience and prioritize the most relevant roles near the top");

  if (weaknesses.some((w) => w.includes("thin"))) {
    improvements.push("Expand each bullet point with the action taken, the tool used, and the measurable result");
  }

  return Array.from(new Set(improvements)).slice(0, 6);
}

export function analyzeResume(resumeText: string, jobDescription: string): AnalysisResult {
  const safeResume = resumeText || "";
  const safeJob = jobDescription || "";

  const requiredSkills = findSkillsInText(safeJob);
  const resumeSkills = findSkillsInText(safeResume);

  const matchedSkills = requiredSkills.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = requiredSkills.filter((skill) => !resumeSkills.includes(skill));

  const percentage = requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 0;

  const matchScore = computeScore(matchedSkills.length, requiredSkills.length, safeResume.length);

  const strengths = buildStrengths(matchedSkills.length > 0 ? matchedSkills : resumeSkills, safeResume);
  const weaknesses = buildWeaknesses(missingSkills, safeResume, percentage);
  const improvements = buildImprovements(missingSkills, weaknesses);
  const certifications = pickCertifications(missingSkills.length > 0 ? missingSkills : resumeSkills);
  const interviewQuestions = buildInterviewQuestions(
    matchedSkills.length > 0 ? matchedSkills : resumeSkills,
    missingSkills
  );

  let summary: string;
  if (matchScore >= 80) {
    summary = "Strong match — your resume aligns closely with this job description. Minor tweaks could push it even further.";
  } else if (matchScore >= 55) {
    summary = "Moderate match — you have relevant experience, but closing a few keyword and skill gaps would meaningfully improve your chances.";
  } else {
    summary = "Weak match — significant gaps exist between your resume and this job description. Consider tailoring your resume before applying.";
  }

  return {
    matchScore,
    summary,
    strengths,
    missingSkills: missingSkills.length > 0 ? missingSkills : ["No major skill gaps detected"],
    weaknesses,
    improvements,
    certifications,
    interviewQuestions,
    matchedKeywords: matchedSkills,
    keywordCoverage: {
      total: requiredSkills.length,
      matched: matchedSkills.length,
      percentage,
    },
  };
}
