import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Send, RotateCcw, Bot, Sparkles, AlertCircle, Volume2 } from 'lucide-react';
import { invokeLocalFunction } from '@/lib/aiHelper';
//import { base44 } from '@/api/base44Client';
import { INTERVIEW_TYPES } from '@/lib/interviewPersonas';
import { detectKeigo } from '@/components/video/KeigoBadge';
import InterviewSetup from '@/components/video/InterviewSetup';
import VideoStage from '@/components/interview/VideoStage';
import CallControls from '@/components/interview/CallControls';
import FeedbackPanel from '@/components/interview/FeedbackPanel';
import { useAppAuth } from '@/lib/appAuth';

const LEVELS = ['N4', 'N3', 'N2', 'N1'];

export default function VoiceInterviewer() {
  const { user } = useAppAuth();
  const [survey, setSurvey] = useState({
    interviewType: null,
    industryRole: '',
    japaneseLevel: LEVELS.includes(user?.level) ? user.level : 'N2',
    focusArea: '志望動機',
  });

  const [phase, setPhase] = useState('setup'); // setup | live | ended
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [camError, setCamError] = useState(null);
  const [sttSupported, setSttSupported] = useState(true);
  const [captions, setCaptions] = useState('');
  const [interim, setInterim] = useState('');
  const [keigoHit, setKeigoHit] = useState(null);
  const [keigoCount, setKeigoCount] = useState(0);
  const [scores, setScores] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [evalError, setEvalError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const mutedRef = useRef(false);

  const typeInfo = INTERVIEW_TYPES.find((t) => t.id === survey.interviewType);
  const currentQ = questions[questionIdx];

  const stopEverything = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopEverything(), [stopEverything]);

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
    } catch (err) {
      setCamError('カメラへのアクセスが拒否されました。Camera access denied — voice & text still work.');
      setCamOn(false);
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSttSupported(false);
      return;
    }
    const recognition = new SR();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      if (finalText) {
        setCaptions((prev) => (prev + ' ' + finalText).trim());
        const hits = detectKeigo(finalText);
        if (hits.length > 0) {
          setKeigoHit(hits[hits.length - 1]);
          setKeigoCount((c) => c + hits.length);
        }
      }
      setInterim(interimText);
      const liveHits = detectKeigo(interimText);
      if (liveHits.length > 0) setKeigoHit(liveHits[liveHits.length - 1]);
    };
    recognition.onerror = () => {};
    recognition.onend = () => {
      if (recognitionRef.current && !mutedRef.current) {
        try { recognition.start(); } catch (e) {}
      }
    };
    try { recognition.start(); } catch (e) {}
  };

  const startInterview = async () => {
    if (!survey.interviewType || !survey.industryRole.trim()) return;
    setSetupLoading(true);
    setSetupError('');
    try {
        const res = await invokeLocalFunction('interviewCoach', { action: 'start', survey });
      //const res = await base44.functions.invoke('interviewCoach', { action: 'start', survey });
      setSession(res.data);
      setQuestions(res.data.questions || []);
      setQuestionIdx(0);
      setCaptions('');
      setInterim('');
      setKeigoHit(null);
      setKeigoCount(0);
      setScores([]);
      setFeedback(null);
      setEvalError('');
      setCamError(null);
      setMuted(false);
      mutedRef.current = false;
      setPhase('live');
      await startMedia();
    } catch (e) {
      setSetupError('AI面接官の準備に失敗しました。もう一度お試しください。');
    } finally {
      setSetupLoading(false);
    }
  };

  const endInterview = () => {
    stopEverything();
    setPhase('ended');
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !next));
    }
    if (next && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    } else if (!next && recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (e) {}
    }
  };

  const toggleCam = () => {
    const next = !camOn;
    setCamOn(next);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = next));
    }
  };

  const submitAnswer = async () => {
    if (!captions.trim() || !currentQ) return;
    setThinking(true);
    setEvalError('');
    try {
        const res = await invokeLocalFunction('interviewCoach', {
      //const res = await base44.functions.invoke('interviewCoach', {
        action: 'evaluate',
        survey,
        question: currentQ.jp,
        answer: captions,
        personaName: session?.personaName,
        tone: session?.tone,
      });
      setFeedback(res.data);
      setScores((prev) => [...prev, Number(res.data.score) || 0]);
    } catch (e) {
      setEvalError('評価の取得に失敗しました。もう一度送信してください。');
    } finally {
      setThinking(false);
    }
  };

  const nextQuestion = () => {
    if (questionIdx < questions.length - 1) {
      setQuestionIdx((i) => i + 1);
      setCaptions('');
      setInterim('');
      setFeedback(null);
      setEvalError('');
    } else {
      endInterview();
    }
  };

  const answerFollowUp = () => {
    const followUp = feedback?.followUp;
    if (!followUp) return;
    setQuestions((prev) => {
      const copy = [...prev];
      copy.splice(questionIdx + 1, 0, { jp: followUp, en: '' });
      return copy;
    });
    setQuestionIdx((i) => i + 1);
    setCaptions('');
    setInterim('');
    setFeedback(null);
    setEvalError('');
  };

  const restartQuestion = () => {
    setCaptions('');
    setInterim('');
    setFeedback(null);
    setEvalError('');
  };

  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';

  // ---------- SETUP PHASE ----------
  if (phase === 'setup') {
    return (
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-6 text-white"
        >
          <h2 className="text-xl font-bold">AI面接官</h2>
          <p className="text-sm text-white/70 mt-1">
            An expert interviewer tailored to you — persona, questions and evaluation adapt to your profile.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-200/40 flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400">AI面接官 / AI Interviewer</p>
            <p className="text-sm font-medium text-navy mt-1">
              こんにちは！本日は面接練習にお越しいただきありがとうございます。
            </p>
            <p className="text-sm text-slate-500 mt-1">
              What kind of interview are you preparing for today? Tell me about yourself below and I'll tailor the session.
            </p>
          </div>
        </motion.div>

        <InterviewSetup
          survey={survey}
          onChange={setSurvey}
          onStart={startInterview}
          loading={setupLoading}
          error={setupError}
        />
      </div>
    );
  }

  // ---------- ENDED PHASE ----------
  if (phase === 'ended') {
    return (
      <div className="max-w-lg mx-auto space-y-5 pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm shadow-slate-200/40"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-navy">面接終了 / Interview Ended</h2>
          <p className="text-sm text-slate-500 mt-1">{session?.personaName}との面接が終了しました。</p>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="px-3 py-2.5 rounded-xl bg-emerald-50">
              <p className="text-xl font-bold text-emerald-600">{keigoCount}</p>
              <p className="text-[10px] font-medium text-emerald-500">敬語 detected</p>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-navy/5">
              <p className="text-xl font-bold text-navy">{avgScore}</p>
              <p className="text-[10px] font-medium text-slate-400">平均スコア / Avg</p>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-slate-50">
              <p className="text-xl font-bold text-navy">{scores.length}</p>
              <p className="text-[10px] font-medium text-slate-400">回答 / Answers</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setPhase('setup')}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> 条件を変える / New Session
            </button>
            <button
              onClick={startInterview}
              className="flex-1 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition"
            >
              もう一度 / Retry
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------- LIVE PHASE ----------
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm shadow-slate-200/40 flex items-start gap-3"
      >
        <div className={`w-10 h-10 rounded-full ${typeInfo?.accent || 'bg-navy'} flex items-center justify-center shrink-0`}>
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-navy">{session?.personaName}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-crimson/10 text-crimson font-semibold">LIVE</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy/10 text-navy font-semibold">{typeInfo?.nameJp}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">{survey.japaneseLevel}</span>
          </div>

          {questionIdx === 0 && !feedback && session?.greetingJp && (
            <div className="mt-2 bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-[11px] text-slate-500 leading-relaxed">{session.greetingJp}</p>
              {session.greetingEn && <p className="text-[10px] text-slate-400 mt-0.5">{session.greetingEn}</p>}
            </div>
          )}

          <p className="text-sm text-navy mt-2 font-medium">{currentQ?.jp}</p>
          {currentQ?.en && <p className="text-[11px] text-slate-400 italic mt-0.5">{currentQ.en}</p>}
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Question {questionIdx + 1}/{questions.length} · {session?.tone}
          </p>
        </div>
      </motion.div>

      <VideoStage
        videoRef={videoRef}
        camOn={camOn}
        camError={camError}
        muted={muted}
        keigoHit={keigoHit}
        keigoCount={keigoCount}
        personaName={session?.personaName}
        accent={typeInfo?.accent || 'bg-navy'}
      />

      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-200/40">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-4 h-4 text-navy" />
          <p className="text-xs font-bold text-navy">回答・ライブ字幕 / Answer & Live Captions</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 ml-auto">ja-JP</span>
        </div>
        {!sttSupported && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Speech recognition not available — type your answer below.
          </div>
        )}
        <textarea
          value={captions + (interim ? ' ' + interim : '')}
          onChange={(e) => setCaptions(e.target.value)}
          placeholder="マイクで話す、またはここに回答を入力してください..."
          rows={4}
          disabled={!!feedback}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-none disabled:opacity-60"
        />

        {evalError && (
          <div className="flex items-center gap-2 text-xs text-crimson bg-crimson/5 border border-crimson/20 rounded-lg px-3 py-2 mt-3">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {evalError}
          </div>
        )}

        {!feedback && (
          <button
            onClick={submitAnswer}
            disabled={!captions.trim() || thinking}
            className="mt-4 w-full py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {thinking ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                面接官が評価中...
              </>
            ) : (
              <><Send className="w-4 h-4" /> 回答を送信</>
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {feedback && (
          <FeedbackPanel
            feedback={feedback}
            transcript={captions}
            onNext={nextQuestion}
            onRestart={restartQuestion}
            onFollowUp={answerFollowUp}
            isLast={questionIdx >= questions.length - 1}
          />
        )}
      </AnimatePresence>

      <CallControls muted={muted} camOn={camOn} onToggleMute={toggleMute} onToggleCam={toggleCam} onEnd={endInterview} />
    </div>
  );
}