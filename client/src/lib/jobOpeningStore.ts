export interface JobOpening {
  id: string;
  title: string;
  description: string;
  url?: string;
  createdAt: string;
  lastUsedAt?: string;
}

const JOB_OPENINGS_KEY = "hiring_assistant_job_openings";

export function getJobOpenings(): JobOpening[] {
  try {
    const raw = localStorage.getItem(JOB_OPENINGS_KEY);
    return raw ? (JSON.parse(raw) as JobOpening[]) : [];
  } catch {
    return [];
  }
}

function writeJobOpenings(openings: JobOpening[]): void {
  localStorage.setItem(JOB_OPENINGS_KEY, JSON.stringify(openings));
}

export function saveJobOpening(input: { title: string; description: string; url?: string }): JobOpening {
  const opening: JobOpening = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    url: input.url,
    createdAt: new Date().toISOString(),
  };
  writeJobOpenings([...getJobOpenings(), opening]);
  return opening;
}

export function updateJobOpening(id: string, patch: Partial<JobOpening>): void {
  writeJobOpenings(getJobOpenings().map((o) => (o.id === id ? { ...o, ...patch } : o)));
}

export function removeJobOpening(id: string): void {
  writeJobOpenings(getJobOpenings().filter((o) => o.id !== id));
}
