const STORAGE_KEY = 'interview_master_resumes_v1';

export function loadSavedResumes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function persistResumes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function buildInitialInput(user) {
  return {
    personal: {
      name: user?.nameJp || user?.name || '',
      furigana: '',
      dob: '',
      gender: '',
      address: '',
      phone: '',
      email: '',
    },
    education: [{ year: '', month: '', detail: '' }],
    work: [],
    qualifications: [
      { year: '', month: '', detail: user?.level ? `日本語能力試験 JLPT ${user.level} 合格` : '' },
    ],
    skills: '',
    hobbies: '',
    desiredRole: user?.industry || '',
    strengths: '',
    motivation: '',
  };
}