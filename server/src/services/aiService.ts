import { AnalysisResult, InterviewQuestionItem } from "../types";

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
  "Relevant industry certification aligned with this job opening",
  "LinkedIn Learning course covering the top skill gaps",
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

function buildInterviewQuestions(strengths: string[], missingSkills: string[]): InterviewQuestionItem[] {
  const questions: InterviewQuestionItem[] = [];

  // Lead with 2-3 behavioral questions
  INTERVIEW_QUESTION_BANK.behavioral.slice(0, 3).forEach((question) => {
    questions.push({ category: "Behavioral", question });
  });

  // Add technical questions probing the candidate's top matched strengths
  strengths.slice(0, 3).forEach((skill) => {
    questions.push({ category: "Technical", question: INTERVIEW_QUESTION_BANK.roleSpecificTemplate(skill) });
  });

  // Add skill-gap questions probing missing requirements
  missingSkills.slice(0, 3).forEach((skill) => {
    questions.push({ category: "Skill-Gap", question: INTERVIEW_QUESTION_BANK.gapTemplate(skill) });
  });

  // Close out with 1-2 closing behavioral questions
  INTERVIEW_QUESTION_BANK.closing.slice(0, 2).forEach((question) => {
    questions.push({ category: "Behavioral", question });
  });

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
    strengths.push(`Demonstrated experience with ${skill}, directly relevant to this job opening`);
  });

  if (/\d+%|\$\d|\d+x|increased|reduced|improved|grew|saved/i.test(resumeText)) {
    strengths.push("Profile includes quantifiable achievements, which strengthens confidence in this candidate's track record");
  }

  if (/lead|led|managed|mentored|supervised/i.test(resumeText)) {
    strengths.push("Shows leadership or mentorship experience — a strong signal for senior hires");
  }

  if (strengths.length === 0) {
    strengths.push("Profile is readable and clearly structured, providing a solid base for evaluation");
  }

  return strengths.slice(0, 8);
}

function buildWeaknesses(missingSkills: string[], resumeText: string, matchPercentage: number): string[] {
  const weaknesses: string[] = [];

  if (missingSkills.length > 0) {
    weaknesses.push(
      `Missing ${missingSkills.length} requirement${missingSkills.length > 1 ? "s" : ""} this job opening emphasizes: ${missingSkills
        .slice(0, 5)
        .join(", ")}`
    );
  }

  if (!/\d+%|\$\d|\d+x|increased|reduced|improved|grew|saved/i.test(resumeText)) {
    weaknesses.push("Lacks quantifiable metrics (numbers, percentages, dollar amounts) to demonstrate impact");
  }

  if (resumeText.trim().split(/\s+/).length < 150) {
    weaknesses.push("Profile content is relatively thin, offering limited visibility into responsibilities and outcomes");
  }

  if (matchPercentage < 40) {
    weaknesses.push("Overall requirement overlap with this job opening is low, which may indicate a weaker fit");
  }

  if (weaknesses.length === 0) {
    weaknesses.push("No major gaps detected against this job opening's stated requirements");
  }

  return weaknesses.slice(0, 6);
}

function buildImprovements(missingSkills: string[], weaknesses: string[]): string[] {
  const improvements: string[] = [];

  if (missingSkills.length > 0) {
    improvements.push(
      `Probe for specific examples or projects demonstrating ${missingSkills.slice(0, 3).join(", ")} during the interview`
    );
  }

  improvements.push("Ask the candidate to quantify past achievements (e.g., % improvement, revenue impact, time saved)");
  improvements.push("Confirm alignment on the key responsibilities called out in this job opening");
  improvements.push("Clarify how prior, less-related experience translates to this role during screening");

  if (weaknesses.some((w) => w.includes("thin"))) {
    improvements.push("Request more detail on the actions taken, tools used, and measurable results for key projects");
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
    summary =
      "Strong hiring match — this candidate's profile aligns closely with the job opening's requirements. A strong candidate to move forward in the process.";
  } else if (matchScore >= 60) {
    summary =
      "Moderate hiring match — the candidate has relevant experience, but a few requirement gaps are worth probing further before deciding.";
  } else {
    summary =
      "Weak hiring match — significant gaps exist between this candidate's profile and the job opening's requirements. Proceed with caution or consider other candidates.";
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
