import { useState, useCallback, useEffect, useRef } from 'react';

export interface SpeechRecognitionError {
  error: string;
  message: string;
}

export const useSpeechRecognition = (onResult: (transcript: string, isFinal: boolean) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<SpeechRecognitionError | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const isManuallyStopped = useRef(true);
  const restartTimeoutRef = useRef<number | null>(null);

  const initRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      // Use queueMicrotask to avoid synchronous setState during initialization/effects
      queueMicrotask(() => {
        setError({ 
          error: 'not-supported', 
          message: 'Speech recognition is not supported in this browser. Try Chrome or Edge.' 
        });
      });
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      queueMicrotask(() => {
        setIsListening(true);
        setError(null);
      });
    };

    recognition.onend = () => {
      if (!isManuallyStopped.current) {
        restartTimeoutRef.current = window.setTimeout(() => {
          if (!isManuallyStopped.current) {
            try {
              recognition.start();
            } catch (e) {
              console.warn('Speech recognition restart failed:', e);
            }
          }
        }, 50); 
      } else {
        queueMicrotask(() => {
          setIsListening(false);
        });
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return; 

      let message = 'An error occurred with voice input.';
      if (event.error === 'not-allowed') {
        message = 'Microphone access denied. Please check your browser permissions.';
        isManuallyStopped.current = true;
      } else if (event.error === 'network') {
        message = 'Network error. Voice recognition requires an internet connection.';
        isManuallyStopped.current = true;
      } else if (event.error === 'aborted') {
        return; 
      }
      
      queueMicrotask(() => {
        setError({ error: event.error, message });
        setIsListening(false);
      });
      console.error('Speech recognition error:', event.error);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    return recognition;
  }, [onResult]);

  useEffect(() => {
    recognitionRef.current = initRecognition();
    
    return () => {
      isManuallyStopped.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors during cleanup
          console.error('Error stopping recognition during cleanup:', e);
        }
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [initRecognition]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      isManuallyStopped.current = false;
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start attempted while already active:', err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStopped.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors
        console.error('Error stopping recognition:', e);
      }
    }
    setIsListening(false);
  }, []);

  return { isListening, startListening, stopListening, error };
};