import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = (onKeywordDetected) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedKeyword, setDetectedKeyword] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      let highestConfidence = 0.9;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        currentTranscript += result[0].transcript;
        if (result[0].confidence) {
          highestConfidence = result[0].confidence;
        }
      }

      setTranscript(currentTranscript);
      setConfidence(highestConfidence);

      const upper = currentTranscript.toUpperCase();
      const keywords = ['HELP', 'ACCIDENT', 'EMERGENCY', 'SOS', 'AMBULANCE', 'CRASH', 'FIRE', 'POLICE'];
      
      for (const kw of keywords) {
        if (upper.includes(kw)) {
          setDetectedKeyword(kw);
          if (onKeywordDetected) {
            onKeywordDetected(kw, currentTranscript, highestConfidence);
          }
          break;
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onKeywordDetected]);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    setDetectedKeyword(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Already started speech recognition:', err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      setIsListening(false);
    }
  }, []);

  const resetSpeech = useCallback(() => {
    setTranscript('');
    setDetectedKeyword(null);
    setConfidence(0);
  }, []);

  return {
    isListening,
    transcript,
    detectedKeyword,
    confidence,
    error,
    startListening,
    stopListening,
    resetSpeech
  };
};
