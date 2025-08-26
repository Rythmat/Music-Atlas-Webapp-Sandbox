import { sortBy } from 'lodash';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/components/utilities';
// import { Env } from '@/constants/env';
import { usePlayingNotes, usePlayNote } from '@/contexts/PianoContext';
import { PlaybackEvent } from '@/contexts/PlaybackContext';
import { MidiNoteEvent, useMidiInput } from '@/hooks/music/useMidiInput';
// import { DragableDebugMidiKeyboard } from './DragableDebugMidiKeyboard';
import {
  OCTAVE_HEIGHT,
  OCTAVE_WIDTH,
  useExpandedRange,
} from './useExpandedRange';

// const DEBUG = Env.isDevelopment();
// const testTarget = DEBUG ? new EventTarget() : undefined;

type PianoKeyboardProps = {
  endC?: number;
  startC?: number;
  className?: string;
  vertical?: boolean;
  playingNotes?: PlaybackEvent[];
  whiteKeyClassName?: string;
  blackKeyClassName?: string;
  blackKeyContainerClassName?: string;
  showOctaveStart?: boolean;
  activeWhiteKeyColor?: string | null;
  activeBlackKeyColor?: string | null;
  onKeyClick?: (midiNumber: number) => void;
  onMidiInput?: (event: MidiNoteEvent) => void;
  enableMidiInterface?: boolean;
};

export function PianoKeyboard({
  endC = 7,
  startC = 3,
  className = '',
  vertical = false,
  playingNotes,
  whiteKeyClassName = '',
  blackKeyClassName = '',
  blackKeyContainerClassName = '',
  onKeyClick,
  showOctaveStart = false,
  activeWhiteKeyColor,
  activeBlackKeyColor,
  onMidiInput,
  enableMidiInterface = false,
}: PianoKeyboardProps) {
  const [localActiveNotes, setLocalActiveNotes] = useState<PlaybackEvent[]>([]);

  const contextPlayingNotes = usePlayingNotes();
  const playNote = usePlayNote();

  const { setRef, expandedEndC, expandedStartC } = useExpandedRange({
    params: {
      mode: vertical ? 'vertical' : 'horizontal',
      startC,
      endC,
    },
  });

  const handleKeyClick = useCallback(
    (note: number) => {
      playNote(note);

      const id = uuidv4();

      const duration = 0.1;

      setLocalActiveNotes((prev) => [
        ...prev,
        {
          id,
          duration,
          midi: note,
          time: Date.now(),
          type: 'note',
          velocity: 1,
        },
      ]);

      onKeyClick?.(note);

      setTimeout(() => {
        setLocalActiveNotes((prev) => prev.filter((n) => n.id !== id));
      }, duration * 1000);
    },
    [playNote, onKeyClick],
  );

  const handleMidiInput = useCallback(
    (event: MidiNoteEvent) => {
      const id = uuidv4();

      setLocalActiveNotes((prev) => [
        ...prev,
        {
          ...event,
          id,
          type: 'note',
          velocity: event.velocity,
          time: Date.now(),
          midi: event.number,
        },
      ]);
      onMidiInput?.(event);

      setTimeout(() => {
        setLocalActiveNotes((prev) => prev.filter((n) => n.id !== id));
      }, event.duration);
    },
    [onMidiInput],
  );

  const { isListening, startListening, stopListening } = useMidiInput(
    handleMidiInput,
    // testTarget,
  );

  const baseWhiteKeyClass = vertical
    ? 'h-4 w-full !z-0 rounded-l-[2px] mb-px bg-white transition-colors cursor-pointer'
    : 'w-4 h-full !z-0 rounded-b-[2px] mr-px bg-white transition-colors cursor-pointer';

  const octaveLabelClass = 'text-[8px] text-black';

  const whiteKeyClass = cn(
    baseWhiteKeyClass,
    {
      'flex flex-col items-center justify-end': showOctaveStart,
    },
    whiteKeyClassName,
  );

  const baseBlackKeyContainerClass = vertical
    ? 'relative h-0 !z-10 overflow-visible -top-2.5'
    : 'relative w-0 !z-10 overflow-visible -left-1.5';

  const blackKeyContainerClass = cn(
    baseBlackKeyContainerClass,
    blackKeyContainerClassName,
  );

  const baseBlackKeyClass = vertical
    ? 'ml-auto w-3/5 h-3 !z-10 rounded-l-[3px] border-l-[3px] border-l-zinc-600 bg-zinc-900 shadow-md transition-colors right-0 cursor-pointer'
    : 'mt-auto h-3/5 w-3 !z-10 rounded-b-[3px] border-b-[3px] border-b-zinc-600 bg-zinc-900 shadow-md transition-colors bottom-0 cursor-pointer';

  const blackKeyClass = cn(baseBlackKeyClass, blackKeyClassName);

  const getActiveNote = (note: number) => {
    const activeNotes = sortBy(
      [...(playingNotes || []), ...contextPlayingNotes, ...localActiveNotes],
      'time',
      'desc',
    );

    return activeNotes.find((n) => {
      if (typeof n === 'number') {
        return n === note;
      }

      return n.midi === note;
    });
  };

  const renderWhiteKey = (note: number) => {
    const activeNote = getActiveNote(note);

    return (
      <div
        key={activeNote?.id}
        className={cn(whiteKeyClass, {
          'bg-primary animate-piano-key-press': !!activeNote,
        })}
        style={{
          backgroundColor: activeNote
            ? activeNote?.color || activeWhiteKeyColor || undefined
            : undefined,
        }}
        onClick={() => handleKeyClick(note)}
      >
        {showOctaveStart && note % 12 === 0 && (
          <div className={octaveLabelClass}>C{Math.floor(note / 12)}</div>
        )}
      </div>
    );
  };

  const renderBlackKey = (note: number) => {
    const activeNote = getActiveNote(note);
    const hasCustomColor = activeNote?.color || activeBlackKeyColor;

    return (
      <div
        className={blackKeyContainerClass}
        onClick={() => handleKeyClick(note)}
      >
        <div
          key={activeNote?.id}
          className={cn(blackKeyClass, {
            'bg-orange-700 animate-piano-key-press': !!activeNote,
            'border-orange-900': !!activeNote,
          })}
          style={{
            backgroundColor: activeNote
              ? activeNote?.color || activeBlackKeyColor || undefined
              : undefined,
            borderColor: activeNote
              ? activeNote?.color || activeWhiteKeyColor || undefined
              : undefined,
            filter: hasCustomColor
              ? 'brightness(0.7) contrast(1.2)'
              : undefined,
          }}
        />
      </div>
    );
  };

  const renderOctave = (octave: number) => {
    const baseNote = octave * 12; // This makes octave 4 start at MIDI note 60 (middle C)

    return (
      <div
        className={cn(vertical ? 'flex flex-col' : 'flex h-full')}
        style={{
          width: vertical ? undefined : `${OCTAVE_WIDTH}px`,
          height: vertical ? `${OCTAVE_HEIGHT}px` : undefined,
        }}
      >
        {renderWhiteKey(baseNote)} {/* C */}
        {renderBlackKey(baseNote + 1)} {/* C# */}
        {renderWhiteKey(baseNote + 2)} {/* D */}
        {renderBlackKey(baseNote + 3)} {/* D# */}
        {renderWhiteKey(baseNote + 4)} {/* E */}
        {renderWhiteKey(baseNote + 5)} {/* F */}
        {renderBlackKey(baseNote + 6)} {/* F# */}
        {renderWhiteKey(baseNote + 7)} {/* G */}
        {renderBlackKey(baseNote + 8)} {/* G# */}
        {renderWhiteKey(baseNote + 9)} {/* A */}
        {renderBlackKey(baseNote + 10)} {/* A# */}
        {renderWhiteKey(baseNote + 11)} {/* B */}
      </div>
    );
  };

  const octaves = Array.from(
    { length: expandedEndC - expandedStartC + 1 },
    (_, i) => expandedStartC + i,
  );

  return (
    <div ref={setRef}>
      <div
        className={cn(
          'relative p-px mx-auto bg-black',
          className,
          vertical ? 'flex flex-col' : 'flex min-h-20 justify-center max-w-fit',
        )}
        style={{
          minWidth: vertical
            ? undefined
            : `${OCTAVE_WIDTH * (endC - startC + 1)}px`,
          minHeight: vertical
            ? `${OCTAVE_HEIGHT * (endC - startC + 1)}px`
            : undefined,
        }}
      >
        {octaves.map((octave) => (
          <div key={octave}>{renderOctave(octave)}</div>
        ))}
        <div className="inset-shadow pointer-events-none absolute inset-0" />
      </div>

      {enableMidiInterface && (
        <button
          onClick={() => (isListening ? stopListening() : startListening())}
        >
          MIDI {isListening ? 'On' : 'Off'}
        </button>
      )}

      {/* {DEBUG && testTarget && (
        <DragableDebugMidiKeyboard eventTarget={testTarget} />
      )} */}
    </div>
  );
}
