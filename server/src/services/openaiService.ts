import Groq from 'groq-sdk';

const MODEL = 'llama-3.3-70b-versatile';

let _groq: Groq | null = null;
const getGroq = (): Groq => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

export interface ParsedJD {
  company: string;
  role: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

export async function parseJobDescription(jd: string): Promise<ParsedJD> {
  const response = await getGroq().chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a job description parser. Extract structured information and return valid JSON only.',
      },
      {
        role: 'user',
        content: `Parse this job description and return a JSON object with exactly these keys:
- company (string): company name
- role (string): job title
- skills (array of strings): required/must-have skills
- niceToHaveSkills (array of strings): nice-to-have/preferred skills
- seniority (string): e.g. "Junior", "Mid-level", "Senior", "Lead"
- location (string): job location or "Remote"

Job Description:
${jd}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from AI');

  let parsed: Partial<ParsedJD>;
  try {
    parsed = JSON.parse(content) as Partial<ParsedJD>;
  } catch {
    throw new Error('AI returned malformed JSON. Please try again.');
  }

  return {
    company: parsed.company ?? '',
    role: parsed.role ?? '',
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills) ? parsed.niceToHaveSkills : [],
    seniority: parsed.seniority ?? '',
    location: parsed.location ?? '',
  };
}

export async function generateResumeSuggestions(parsedJD: ParsedJD): Promise<string[]> {
  try {
    const response = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional resume writer. Generate specific, quantifiable resume bullet points. Return valid JSON only.',
        },
        {
          role: 'user',
          content: `Generate 4 strong resume bullet points for a ${parsedJD.seniority} ${parsedJD.role} position at ${parsedJD.company}.
Required skills to highlight: ${parsedJD.skills.slice(0, 6).join(', ')}.
Rules:
- Start each bullet with a strong action verb
- Include metrics/numbers where reasonable
- Be specific to the role, not generic
- Keep each bullet under 120 characters

Return JSON: { "suggestions": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"] }`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) return [];

    const result = JSON.parse(content) as { suggestions?: string[] };
    return Array.isArray(result.suggestions) ? result.suggestions : [];
  } catch {
    return [];
  }
}
