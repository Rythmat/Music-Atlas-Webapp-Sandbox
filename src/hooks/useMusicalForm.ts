import { KeyboardEvent, useCallback, useRef } from 'react';
import { usePlayNote } from '@/contexts/PianoContext';

type ChordProgression = number[][];
type Melody = number[];

interface MusicalFormConfig {
  typingMelody?: Melody;
  successProgression?: ChordProgression;
  failureProgression?: ChordProgression;
  autofillProgression?: ChordProgression;
}

interface MusicalInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export const useMusicalForm = (config: MusicalFormConfig = {}) => {
  const {
    typingMelody = [],
    successProgression = [
      [60, 64, 67],
      [65, 69, 72],
      [67, 71, 74],
      [72, 76, 79],
    ], // Default C major progression
    failureProgression = [
      [60, 63, 67],
      [67, 71, 74],
      [68, 72, 75],
      [67, 71, 74],
    ], // Default minor progression
    autofillProgression = [
      [67, 70, 74, 77],
      [72, 75, 79, 82],
      [65, 69, 72, 76],
    ], // Default jazz progression
  } = config;

  const noteIndex = useRef<number | null>(null);
  const previousValue = useRef<string>('');
  const playNote = usePlayNote();

  const playProgression = useCallback(
    (progression: number[][]) => {
      progression.forEach((chord, chordIndex) => {
        chord.forEach((note, noteIndex) => {
          setTimeout(() => playNote(note), chordIndex * 500 + noteIndex * 32);
        });
      });
    },
    [playNote],
  );

  const playTypingNote = useCallback(() => {
    if (typingMelody.length === 0) return;

    const currentIndex = noteIndex.current || -1;
    const nextIndex = (currentIndex + 1) % typingMelody.length;
    const note = typingMelody[nextIndex];

    playNote(note);
    noteIndex.current = nextIndex;
  }, [playNote, typingMelody]);

  const checkAutofill = useCallback(
    (currentValue: string, prevValue: string) => {
      if (
        currentValue.length > prevValue.length &&
        currentValue.length - prevValue.length > 1
      ) {
        playProgression(autofillProgression);
      }
    },
    [playProgression, autofillProgression],
  );

  const createInputProps = useCallback(
    (
      fieldOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    ): MusicalInputProps => ({
      onChange: (e) => {
        fieldOnChange(e);
        checkAutofill(e.target.value, previousValue.current);
        previousValue.current = e.target.value;
      },
      onKeyDown: playTypingNote,
    }),
    [checkAutofill, playTypingNote],
  );

  return {
    playSuccessProgression: () => playProgression(successProgression),
    playFailureProgression: () => playProgression(failureProgression),
    createInputProps,
    playTypingNote,
  };
};
