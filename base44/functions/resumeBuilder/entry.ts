import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const PERSONAL_SCHEMA = {
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
};

const HISTORY_SCHEMA = {
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
};

const QUALIFICATION_SCHEMA = {
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
};

const RESUME_SCHEMA = {
  type: 'object',
  properties: {
    page1_left: {
      type: 'object',
      properties: {
        personal_info: PERSONAL_SCHEMA,
        education_and_work: HISTORY_SCHEMA,
      },
      required: ['personal_info', 'education_and_work'],
    },
    page2_right: {
      type: 'object',
      properties: {
        qualifications: QUALIFICATION_SCHEMA,
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

const entryLine = (entry) => `${entry.year ? `${entry.year}年` : ''}${entry.month ? `${entry.month}月` : ''} ${entry.detail}`.trim();

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

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const input = body.input || {};
    const personal = input.personal || {};

    const name = text(personal.name, 60);
    if (!name) {
      return Response.json({ error: 'お名前を入力してください / name is required' }, { status: 400 });
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

==================================================
OUTPUT FORMAT & STRUCTURE RULES
==================================================
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

Never invent schools, employers or qualifications that were not provided.
Return ONLY the JSON object described by the provided schema.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: RESUME_SCHEMA,
    });

    const info = result?.page1_left?.personal_info || {};
    const history = historyRows(result?.page1_left?.education_and_work, '学歴', 25);
    if (!history.some((row) => row.type === '終了' || row.content === '以上')) {
      history.push({ year: '', month: '', type: '終了', content: '以上' });
    }

    const resume = {
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
    };

    return Response.json({ resume });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}