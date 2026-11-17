
async function callGemini(prompt, schema) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is missing in .env file');
  }

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  };

  // Billing မလိုသော Free Gemini API Endpoint ကို Proxy မှတစ်ဆင့် ခေါ်ခြင်း
  const response = await fetch(
    //`/gemini-api/v1beta/models/gemini-2.5-flash:generateContent`,
    `/gemini-api/v1beta/models/gemini-3-flash-preview:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('Gemini API Error Details:', err);
    throw new Error(err.error?.message || 'Gemini API request failed');
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(rawText);
}
// ==========================================
// 1. RESUME BUILDER LOGIC
// ==========================================
const RESUME_SCHEMA = {
  type: 'object',
  properties: {
    page1_left: {
      type: 'object',
      properties: {
        personal_info: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            furigana: { type: 'string' },
            dob: { type: 'string' },
            gender: { type: 'string' },
            address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
          },
          required: ['name', 'furigana', 'dob', 'gender', 'address', 'phone', 'email'],
        },
        education_and_work: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              year: { type: 'string' },
              month: { type: 'string' },
              type: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['year', 'month', 'type', 'content'],
          },
        },
      },
      required: ['personal_info', 'education_and_work'],
    },
    page2_right: {
      type: 'object',
      properties: {
        qualifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              year: { type: 'string' },
              month: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['year', 'month', 'content'],
          },
        },
        skills_and_hobbies: {
          type: 'object',
          properties: {
            technical_skills: { type: 'string' },
            hobbies: { type: 'string' },
          },
          required: ['technical_skills', 'hobbies'],
        },
        self_pr: { type: 'string' },
        motivation: { type: 'string' },
      },
      required: ['qualifications', 'skills_and_hobbies', 'self_pr', 'motivation'],
    },
  },
  required: ['page1_left', 'page2_right'],
};

const text = (value, max) => String(value ?? '').trim().slice(0, max);

const inputEntries = (list, max) =>
  (Array.isArray(list) ? list : [])
    .filter((entry) => entry && text(entry.detail, 200))
    .slice(0, max)
    .map((entry) => ({
      year: text(entry.year, 4),
      month: text(entry.month, 2),
      detail: text(entry.detail, 200),
    }));

const entryLine = (entry) =>
  `${entry.year ? `${entry.year}年` : ''}${entry.month ? `${entry.month}月` : ''} ${entry.detail}`.trim();

const historyRows = (list, type, max) =>
  (Array.isArray(list) ? list : [])
    .filter((row) => row && text(row.content, 200))
    .slice(0, max)
    .map((row) => ({
      year: text(row.year, 4),
      month: text(row.month, 2),
      type: text(row.type, 10) || type,
      content: text(row.content, 200),
    }));

const qualificationRows = (list, max) =>
  (Array.isArray(list) ? list : [])
    .filter((row) => row && text(row.content, 200))
    .slice(0, max)
    .map((row) => ({
      year: text(row.year, 4),
      month: text(row.month, 2),
      content: text(row.content, 200),
    }));

async function handleResumeBuilder({ input = {} }) {
  const personal = input.personal || {};
  const name = text(personal.name, 60);
  if (!name) {
    throw new Error('お名前を入力してください / name is required');
  }

  const education = inputEntries(input.education, 15);
  const work = inputEntries(input.work, 15);
  const qualifications = inputEntries(input.qualifications, 15);
  const listOrNone = (list) => (list.length ? list.map(entryLine).join(' / ') : 'なし');

  const prompt = `You are an expert Japanese Resume Generator engine for "面接マスター".
Your goal is to format the candidate inputs below into a JSON payload structured EXACTLY for a two-page standard Japanese JIS Resume layout (履歴書).

[USER INPUT DATA]
- Name: ${name}
- Furigana: ${text(personal.furigana, 60) || 'なし'}
- Date of Birth: ${text(personal.dob, 40) || 'なし'}
- Gender: ${text(personal.gender, 20) || 'なし'}
- Address: ${text(personal.address, 160) || 'なし'}
- Phone: ${text(personal.phone, 30) || 'なし'}
- Email: ${text(personal.email, 80) || 'なし'}
- Education History: ${listOrNone(education)}
- Work Experience: ${listOrNone(work)}
- Qualifications: ${listOrNone(qualifications)}
- Technical Skills: ${text(input.skills, 400) || 'なし'}
- Hobbies / Special Talents: ${text(input.hobbies, 200) || 'なし'}
- Target Position: ${text(input.desiredRole, 80) || 'なし'}
- Application Reason: ${text(input.motivation, 600) || 'なし'}

OUTPUT FORMAT & STRUCTURE RULES:
1. page1_left.personal_info: echo the candidate data faithfully; format dob as YYYY年MM月DD日 when a date is known.
2. page1_left.education_and_work: chronological academic history FIRST (type "学歴"), then work history (type "職歴").
- Add standard Japanese endings strictly: 入学, 卒業, 卒業見込み, 入社, 退社.
- year as a 4-digit string, month as a 2-digit string (01-12), content in Japanese (e.g. "○○高等学校 入学").
- The FINAL row must be {"year": "", "month": "", "type": "終了", "content": "以上"}.
3. page2_right.qualifications: official Japanese titles with status, year/month + content (e.g. "日本語能力試験 JLPT N2 合格"). Use an empty array when none were provided.
4. page2_right.skills_and_hobbies.technical_skills: the technical skills summarized in natural Japanese.
- page2_right.skills_and_hobbies.hobbies: the hobbies / special talents in natural Japanese.
5. page2_right.self_pr: a structured 自己PR in professional Japanese (200-300 characters) using PREP format (Point, Reason, Example, Point) with です・ます調.
6. page2_right.motivation: a clear, formal 志望動機 statement in professional Japanese (200-300 characters) with です・ます調.

Leave every field the candidate did not provide as an empty string "", never the word "なし".
Never invent schools, employers or qualifications that were not provided.`;

  const result = await callGemini(prompt, RESUME_SCHEMA);

  const info = result?.page1_left?.personal_info || {};
  const history = historyRows(result?.page1_left?.education_and_work, '学歴', 25);
  if (!history.some((row) => row.type === '終了' || row.content === '以上')) {
    history.push({ year: '', month: '', type: '終了', content: '以上' });
  }

  return {
    data: {
      resume: {
        page1_left: {
          personal_info: {
            name: text(info.name, 60) || name,
            furigana: text(info.furigana, 60) || text(personal.furigana, 60),
            dob: text(info.dob, 40) || text(personal.dob, 40),
            gender: text(info.gender, 20) || text(personal.gender, 20),
            address: text(info.address, 160) || text(personal.address, 160),
            phone: text(info.phone, 30) || text(personal.phone, 30),
            email: text(info.email, 80) || text(personal.email, 80),
          },
          education_and_work: history,
        },
        page2_right: {
          qualifications: qualificationRows(result?.page2_right?.qualifications, 15),
          skills_and_hobbies: {
            technical_skills:
              text(result?.page2_right?.skills_and_hobbies?.technical_skills, 800) || text(input.skills, 800),
            hobbies: text(result?.page2_right?.skills_and_hobbies?.hobbies, 300) || text(input.hobbies, 300),
          },
          self_pr: text(result?.page2_right?.self_pr, 1200),
          motivation: text(result?.page2_right?.motivation, 1200),
        },
      },
    },
  };
}

// ==========================================
// 2. INTERVIEW COACH LOGIC
// ==========================================
const TYPE_LABEL = {
  part_time: 'Part-time job (アルバイト)',
  full_time: 'Full-time career (中途/新卒)',
  university: 'University admission interview (大学面接)',
};

const LEVEL_NOTE = {
  N4: 'very simple Japanese: short sentences, everyday vocabulary, only です/ます politeness',
  N3: 'simple Japanese: short clear sentences, basic です/ます and common business phrases',
  N2: 'natural business Japanese with standard 敬語 (尊敬語・謙譲語の基本)',
  N1: 'advanced business Japanese with nuanced 敬語 and idiomatic expressions',
};

const PERSONA_RULES = {
  part_time:
    'Warm, polite and encouraging — prioritize shift availability, commute time, basic communication, customer-service mindset and motivation.',
  full_time:
    'Formal and professional, strict keigo and logic evaluator — prioritize work experience, PREP-structured answers, problem solving and career goals.',
  university:
    'Calm, encouraging admissions interviewer — prioritize reasons for choosing the department, academic interest, school activities and future plans.',
};

const START_SCHEMA = {
  type: 'object',
  properties: {
    personaName: { type: 'string' },
    personaNameEn: { type: 'string' },
    tone: { type: 'string' },
    greetingJp: { type: 'string' },
    greetingEn: { type: 'string' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          jp: { type: 'string' },
          en: { type: 'string' },
        },
        required: ['jp', 'en'],
      },
    },
  },
  required: ['personaName', 'tone', 'greetingJp', 'questions'],
};

const EVAL_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number' },
    corrected: { type: 'string' },
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: { from: { type: 'string' }, to: { type: 'string' } },
        required: ['from', 'to'],
      },
    },
    tips: { type: 'array', items: { type: 'string' } },
    followUp: { type: 'string' },
  },
  required: ['score', 'corrected', 'corrections', 'tips', 'followUp'],
};

async function handleInterviewCoach(body) {
  const survey = body.survey || {};
  const interviewType = TYPE_LABEL[survey.interviewType] ? survey.interviewType : 'full_time';
  const industryRole = String(survey.industryRole || '').trim().slice(0, 80);
  const japaneseLevel = LEVEL_NOTE[survey.japaneseLevel] ? survey.japaneseLevel : 'N2';
  const focusArea = String(survey.focusArea || '').trim().slice(0, 60) || '志望動機';
  const personaInstruction = String(survey.personaInstruction || '').trim().slice(0, 400);
  const questionCount = Math.max(3, Math.min(5, Number(survey.questionCount) || 4));

  if (body.action === 'start') {
    const prompt = `You are an AI Interviewer. Analyze the user's survey response below and generate a tailored interview session.

User Survey Input:
- Type: ${TYPE_LABEL[interviewType]}
- Target Job: ${industryRole || 'unspecified'}
- Japanese Level: JLPT ${japaneseLevel}
- Primary Goal: ${focusArea}

Task:
1. Set your persona matching the job: ${industryRole || 'the stated role'}. ${PERSONA_RULES[interviewType]}
2. Create ${questionCount} realistic interview questions specific to ${industryRole || 'the stated role'}, emphasizing ${focusArea}. No repeated themes.${
      personaInstruction
        ? `\n   Additional candidate instruction (highest priority, overrides the persona defaults above): ${personaInstruction}`
        : ''
    }
3. Start the video/voice interview now by asking Question 1 in Japanese — question 1 is always a short self-introduction.

Language rule: all Japanese must match JLPT ${japaneseLevel} — ${LEVEL_NOTE[japaneseLevel]}. Never exceed that level.

Return these fields:
- personaName: an interviewer name in Japanese (e.g. 田中 健一)
- personaNameEn: romanized name
- tone: 3-5 English words describing the tone (e.g. "Formal and strict")
- greetingJp: 2-3 polite Japanese sentences introducing yourself and setting expectations, at the candidate's level
- greetingEn: faithful English translation of the greeting
- questions: ${questionCount} items, each with jp (natural spoken Japanese, ONE sentence, max 60 characters) and en (faithful English translation)`;

    const result = await callGemini(prompt, START_SCHEMA);
    const questions = Array.isArray(result?.questions) ? result.questions.slice(0, questionCount) : [];
    if (questions.length === 0) {
      throw new Error('Could not generate questions');
    }
    return { data: { ...result, questions } };
  }

  if (body.action === 'evaluate') {
    const question = String(body.question || '').trim().slice(0, 300);
    const answer = String(body.answer || '').trim().slice(0, 2000);
    const personaName = String(body.personaName || '').trim().slice(0, 40);
    const tone = String(body.tone || '').trim().slice(0, 60);

    const prompt = `You are the interviewer "${personaName || 'AI面接官'}" (${tone || 'polite'}) conducting a ${TYPE_LABEL[interviewType]} for the role "${industryRole || 'unspecified'}".
Candidate Japanese level: JLPT ${japaneseLevel} — ${LEVEL_NOTE[japaneseLevel]}. Primary focus of this session: ${focusArea}.

Question asked: ${question}
Candidate answer (speech transcript): ${answer}

Tasks:
1. score: 0-10 judging answer substance, keigo accuracy, structure and relevance. Judge against JLPT ${japaneseLevel} expectations — do NOT penalize an N3 candidate for missing N1-level keigo.
2. corrected: rewrite the answer as natural formal Japanese appropriate to the candidate's level, preserving their meaning and details.
3. corrections: up to 4 specific fixes actually present in the answer, each {from, to}. Use an empty array if the answer is already correct.
4. tips: exactly 3 short English coaching tips specific to THIS answer (structure, keigo, and content).
5. followUp: if the answer is under ~50 Japanese characters, vague, missing a concrete example, or avoids the question, write ONE probing follow-up question in Japanese at the candidate's level. Otherwise return an empty string.

All Japanese must match JLPT ${japaneseLevel}.`;

    const result = await callGemini(prompt, EVAL_SCHEMA);
    return {
      data: {
        score: Math.max(0, Math.min(10, Number(result?.score) || 0)),
        corrected: String(result?.corrected || answer),
        corrections: Array.isArray(result?.corrections) ? result.corrections.slice(0, 4) : [],
        tips: Array.isArray(result?.tips) ? result.tips.slice(0, 3) : [],
        followUp: String(result?.followUp || '').trim(),
      },
    };
  }

  throw new Error('Unknown action');
}

// ==========================================
// 3. MAIN EXPORTED ROUTER
// ==========================================
export async function invokeLocalFunction(name, payload) {
  if (name === 'resumeBuilder') {
    return handleResumeBuilder(payload);
  }
  if (name === 'interviewCoach') {
    return handleInterviewCoach(payload);
  }
  throw new Error(`Unknown function: ${name}`);
}