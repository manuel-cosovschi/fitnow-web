import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionEventLike {
  results: { [i: number]: { [j: number]: { transcript: string; confidence: number } } & { length: number } } & { length: number };
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechCtor | null {
  const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface VoiceState {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
}

/**
 * Web Speech API wrapper. Supports es-AR locale and returns interim + final transcripts.
 */
export function useVoiceCommand(onFinal: (text: string) => void, lang = 'es-AR') {
  const [state, setState] = useState<VoiceState>({
    supported: getSpeechRecognitionCtor() != null,
    listening: false,
    transcript: '',
    error: null,
  });
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) { setState(s => ({ ...s, error: 'Reconocimiento de voz no soportado' })); return; }

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = e => {
      const resultList = e.results;
      let interim = '';
      let final = '';
      for (let i = 0; i < resultList.length; i++) {
        const r = resultList[i];
        const alt = r[0];
        if ((r as unknown as { isFinal?: boolean }).isFinal) final += alt.transcript;
        else interim += alt.transcript;
      }
      setState(s => ({ ...s, transcript: (final || interim).trim() }));
      if (final.trim()) onFinalRef.current(final.trim());
    };
    rec.onerror = () => setState(s => ({ ...s, error: 'Error de voz', listening: false }));
    rec.onend = () => setState(s => ({ ...s, listening: false }));

    recRef.current = rec;
    rec.start();
    setState(s => ({ ...s, listening: true, error: null, transcript: '' }));
  }, [lang]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setState(s => ({ ...s, listening: false }));
  }, []);

  useEffect(() => () => { recRef.current?.abort(); }, []);

  return { ...state, start, stop };
}

/**
 * Uses browser SpeechSynthesis for coach messages. Degrades silently on unsupported browsers.
 */
export function speak(text: string, lang = 'es-AR') {
  if (typeof speechSynthesis === 'undefined') return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 1;
  u.pitch = 1;
  speechSynthesis.speak(u);
}
