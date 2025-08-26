import { useEffect, useRef } from 'react';

interface PianoKeyboardProps {
  selectedNote?: number;
}

// MIDI note numbers for reference
const MIDI_NOTE_MIN = 21; // A0
const MIDI_NOTE_MAX = 108; // C8

// Note names
const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

// Check if a note is a black key
const isBlackKey = (noteNumber: number) => {
  const noteIndex = noteNumber % 12;
  return [1, 3, 6, 8, 10].includes(noteIndex);
};

// Get note name from MIDI note number
const getNoteNameWithOctave = (noteNumber: number) => {
  const octave = Math.floor(noteNumber / 12) - 1;
  const noteName = NOTE_NAMES[noteNumber % 12];
  return `${noteName}${octave}`;
};

export const PianoKeyboard = ({ selectedNote }: PianoKeyboardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate all keys from MIDI_NOTE_MIN to MIDI_NOTE_MAX
  const keys = Array.from(
    { length: MIDI_NOTE_MAX - MIDI_NOTE_MIN + 1 },
    (_, i) => {
      const noteNumber = MIDI_NOTE_MIN + i;
      return {
        noteNumber,
        isBlack: isBlackKey(noteNumber),
        noteName: getNoteNameWithOctave(noteNumber),
      };
    },
  ).reverse(); // Reverse to have higher notes at the top

  // Scroll to selected note
  useEffect(() => {
    if (selectedNote && containerRef.current) {
      const keyElement = containerRef.current.querySelector(
        `[data-note="${selectedNote}"]`,
      );
      if (keyElement) {
        keyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedNote]);

  return (
    <div
      ref={containerRef}
      className="w-16 overflow-y-auto border-r bg-background"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      <div className="relative">
        {keys.map((key) => (
          <div
            key={key.noteNumber}
            className={`
              flex h-6 items-center justify-between border-b border-muted
              ${key.isBlack ? 'bg-neutral-800 text-white' : 'bg-white text-black dark:bg-neutral-950 dark:text-white'}
              ${selectedNote === key.noteNumber ? 'bg-primary/20' : ''}
            `}
            data-note={key.noteNumber}
          >
            {/* Only show note names for C notes */}
            {key.noteName.endsWith('0') && (
              <span className="truncate px-1 text-xs">{key.noteName}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
