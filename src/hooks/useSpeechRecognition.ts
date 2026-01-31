
import { useState, useCallback, useEffect, useRef } from 'react';

export interface SpeechRecognitionError {
  error: string;
  message: string;
}

export const useSpeechRecognition = (onResult: (transcript: string, isFinal: boolean) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<SpeechRecognitionError | null>(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        let message = 'An error occurred with voice input.';
        if (event.error === 'not-allowed') {
          message = 'Microphone access denied. Please enable it in browser settings.';
        } else if (event.error === 'no-speech') {
          message = 'No speech detected. Please try again.';
          return; // Don't show error state for just being quiet
        } else if (event.error === 'network') {
          message = 'Network error. Voice input requires an internet connection.';
        }
        
        setError({ error: event.error, message });
        setIsListening(false);
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

      recognitionRef.current = recognition;
    } else {
      setError({ 
        error: 'not-supported', 
        message: 'Speech recognition is not supported in this browser. Try Chrome or Edge.' 
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        // Recognition might already be started or in a weird state
        console.warn('Speech recognition start failed:', err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return { isListening, startListening, stopListening, error };
};
