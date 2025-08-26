import { NoteType } from '@/hooks/data/tunes/useTune';

export const MIN_START_VALUE = 0;
export const START_STEP = 0.03125; // 1/32
export const MAX_START_VALUE = 1;

export function getNoteNameFromMidi(midi: number): string {
  const notes = [
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
  const name = notes[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function quantizeStartOffset(
  value: number,
  step: number = START_STEP,
  min = MIN_START_VALUE,
): number {
  const quantized = Math.round(value / step) * step;
  return quantized < min ? min : quantized;
}

// Its not complex, its just a lot of if statements
// eslint-disable-next-line sonarjs/cognitive-complexity
export function handleBeatUnitChange(value: string, oldValue: string): number {
  const number = Number(value);
  const oldNumber = Number(oldValue);

  if (isNaN(number)) {
    return 1;
  }

  const isDecrease = number < oldNumber;

  if (number <= 1) {
    return 1;
  }

  if (number === 2) {
    return 2;
  }

  if (number === 3) {
    if (isDecrease) {
      return 2;
    }

    return 4;
  }

  if (number > 4 && number < 8) {
    if (isDecrease) {
      return 4;
    }

    return 8;
  }

  if (number >= 8 && number < 16) {
    if (isDecrease) {
      return 8;
    }

    return 16;
  }

  if (number >= 16 && number <= 32) {
    if (isDecrease) {
      return 16;
    }

    return 32;
  }

  return 32;
}

/**
 * Given a beats per measure, beat unit, and note type, return the duration of the note in beats
 * @param beatUnit 1, 2, 4, 8, 16, 32
 * @param noteType whole, half, quarter, eighth, sixteenth, thirtysecond, dotted_whole, dotted_half, dotted_quarter, dotted_eighth, dotted_sixteenth
 */
export function getNoteDuration(beatUnit: number, noteType: NoteType): number {
  // Map note types to their duration as a fraction of a whole note
  const NOTE_TYPE_TO_FRACTION: Record<string, number> = {
    whole: 1,
    half: 1 / 2,
    quarter: 1 / 4,
    eighth: 1 / 8,
    sixteenth: 1 / 16,
    thirtysecond: 1 / 32,
    dotted_whole: 1.5,
    dotted_half: 0.75,
    dotted_quarter: 0.375,
    dotted_eighth: 0.1875,
    dotted_sixteenth: 0.09375,
  };

  // Duration of a whole note in beats (relative to the beat unit)
  // For example, in 4/4, beatUnit=4 (quarter note gets 1 beat), so whole note = 4 beats
  const wholeNoteBeats = 4 * (1 / (beatUnit / 4));

  const fraction = NOTE_TYPE_TO_FRACTION[noteType] ?? 0;
  return wholeNoteBeats * fraction;
}
