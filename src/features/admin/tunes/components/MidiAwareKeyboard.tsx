import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { getNoteDuration, getNoteNameFromMidi } from './helpers';
import { TuneEditorFormValues } from './types';

export const MidiAwareKeyboard = () => {
  const form = useFormContext<TuneEditorFormValues>();

  const handleMidiInput = useCallback(
    ({
      number: midiNumber,
      velocity,
      duration,
    }: {
      number: number;
      velocity: number;
      duration: number;
    }) => {
      const beatsPerMeasure = form.getValues('beatsPerMeasure');

      const measures = form.getValues('Measures');
      const lastMeasureIndex = measures.length - 1;
      const lastMeasure = measures[lastMeasureIndex];

      const pitch = getNoteNameFromMidi(midiNumber); // e.g., "C4"

      // TO-DO: Infer type from duration and tempo config

      const newNote = {
        pitch,
        velocity: velocity,
        startOffsetInBeats: 0, // will set below
        type: 'quarter',
      };

      if (!lastMeasure) {
        // No measures yet, create a new one
        form.setValue(`Measures`, [
          {
            id: uuidv4(),
            label: '',
            color: '',
            repeatEnd: false,
            repeatStart: false,
            repeatTimes: '0',
            number: (measures.length + 1).toString(),
            Notes: [
              {
                ...newNote,
                startOffsetInBeats: '0',
                id: uuidv4(),
                label: '',
                color: '',
                type: 'quarter',
                velocity: velocity.toString(),
                pitch,
              },
            ],
          },
        ]);
        return;
      }

      // how many notes fit in a measure and count them
      // Sum all durations in the last measure to determine current beat position
      const lastNote = lastMeasure.Notes.at(-1);
      const lastNoteDuration = lastNote
        ? getNoteDuration(Number(form.getValues('beatUnit')), lastNote.type)
        : 0;

      const currentStart =
        lastNoteDuration + Number(lastNote?.startOffsetInBeats ?? 0);

      const isMeasureFull =
        currentStart + Number(duration) > Number(beatsPerMeasure);

      if (isMeasureFull) {
        // Create new measure with this note
        form.setValue(`Measures`, [
          ...measures,
          {
            id: uuidv4(),
            label: '',
            color: '',
            repeatEnd: false,
            repeatStart: false,
            repeatTimes: '0',
            number: (measures.length + 1).toString(),
            Notes: [
              {
                ...newNote,
                startOffsetInBeats: '0',
                id: uuidv4(),
                label: '',
                color: '',
                velocity: velocity.toString(),
                pitch,
                type: 'quarter',
              },
            ],
          },
        ]);
      } else {
        // Add note to the current measure
        form.setValue(`Measures`, [
          ...measures.slice(0, lastMeasureIndex),
          {
            ...lastMeasure,
            Notes: [
              ...lastMeasure.Notes,
              {
                ...newNote,
                startOffsetInBeats: currentStart.toString(),
                id: uuidv4(),
                label: '',
                color: '',
                velocity: velocity.toString(),
                pitch,
                type: 'quarter',
              },
            ],
          },
          ...measures.slice(lastMeasureIndex + 1),
        ]);
      }
    },
    [form],
  );

  const handleKeyClick = useCallback(
    (midiNumber: number) => {
      handleMidiInput({
        number: midiNumber,
        velocity: 100,
        duration: 1,
      });
    },
    [handleMidiInput],
  );

  return (
    <PianoKeyboard
      enableMidiInterface
      onKeyClick={handleKeyClick}
      onMidiInput={handleMidiInput}
    />
  );
};
