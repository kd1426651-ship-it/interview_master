import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

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

const PERSONA_RULES = {
  part_time:
    'Warm, polite and encouraging — prioritize shift availability, commute time, basic communication, customer-service mindset and motivation.',
  full_time:
    'Formal and professional, strict keigo and logic evaluator — prioritize work experience, PREP-structured answers, problem solving and career goals.',
  university:
    'Calm, encouraging admissions interviewer — prioritize reasons for choosing the department, academic interest, school activities and future plans.',
};

// Builds the tailored interviewer session prompt from the candidate survey.
const generateInterviewPrompt = (survey) => `You are an AI Interviewer. Analyze the user's survey response below and generate a tailored interview session.

User Survey Input:
- Type: ${TYPE_LABEL[survey.interviewType]}
- Target Job: ${survey.industryRole || 'unspecified'}
- Japanese Level: JLPT ${survey.japaneseLevel}
- Primary Goal: ${survey.focusArea}

Task:
1. Set your persona matching the job: ${survey.industryRole || 'the stated role'}. ${PERSONA_RULES[survey.interviewType]}
2. Create ${survey.questionCount} realistic interview questions specific to ${survey.industryRole || 'the stated role'}, emphasizing ${survey.focusArea}. No repeated themes.${
  survey.personaInstruction
    ? `\n   Additional candidate instruction (highest priority, overrides the persona defaults above): ${survey.personaInstruction}`
    : ''
}
3. Start the video/voice interview now by asking Question 1 in Japanese — question 1 is always a short self-introduction.

Language rule: all Japanese must match JLPT ${survey.japaneseLevel} — ${LEVEL_NOTE[survey.japaneseLevel]}. Never exceed that level.

Return these fields:
- personaName: an interviewer name in Japanese (e.g. 田中 健一)
- personaNameEn: romanized name
- tone: 3-5 English words describing the tone (e.g. "Formal and strict")
- greetingJp: 2-3 polite Japanese sentences introducing yourself and setting expectations, at the candidate's level
- greetingEn: faithful English translation of the greeting
- questions: ${survey.questionCount} items, each with jp (natural spoken Japanese, ONE sentence, max 60 characters) and en (faithful English translation)`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const survey = body.survey || {};
    const interviewType = TYPE_LABEL[survey.interviewType] ? survey.interviewType : 'full_time';
    const industryRole = String(survey.industryRole || '').trim().slice(0, 80);
    const japaneseLevel = LEVEL_NOTE[survey.japaneseLevel] ? survey.japaneseLevel : 'N2';
    const focusArea = String(survey.focusArea || '').trim().slice(0, 60) || '志望動機';
    const personaInstruction = String(survey.personaInstruction || '').trim().slice(0, 400);
    const questionCount = Math.max(3, Math.min(5, Number(survey.questionCount) || 4));

    if (body.action === 'start') {
      const prompt = generateInterviewPrompt({
        interviewType,
        industryRole,
        japaneseLevel,
        focusArea,
        questionCount,
        personaInstruction,
      });

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: START_SCHEMA,
      });

      const questions = Array.isArray(result?.questions) ? result.questions.slice(0, questionCount) : [];
      if (questions.length === 0) {
        return Response.json({ error: 'Could not generate questions' }, { status: 502 });
      }
      return Response.json({ ...result, questions });
    }

    if (body.action === 'evaluate') {
      const question = String(body.question || '').trim().slice(0, 300);
      const answer = String(body.answer || '').trim().slice(0, 2000);
      const personaName = String(body.personaName || '').trim().slice(0, 40);
      const tone = String(body.tone || '').trim().slice(0, 60);
      if (!question || !answer) {
        return Response.json({ error: 'question and answer are required' }, { status: 400 });
      }

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

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: EVAL_SCHEMA,
      });

      return Response.json({
        score: Math.max(0, Math.min(10, Number(result?.score) || 0)),
        corrected: String(result?.corrected || answer),
        corrections: Array.isArray(result?.corrections) ? result.corrections.slice(0, 4) : [],
        tips: Array.isArray(result?.tips) ? result.tips.slice(0, 3) : [],
        followUp: String(result?.followUp || '').trim(),
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}