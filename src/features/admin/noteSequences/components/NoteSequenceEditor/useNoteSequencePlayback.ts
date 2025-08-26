import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { usePlayback } from '@/contexts/PlaybackContext';
import { NoteSequence } from '@/hooks/data';
import { NoteSequenceFormValues } from './types';

export const useNoteSequencePlayback = (
  form: UseFormReturn<NoteSequenceFormValues>,
  noteSequence: NoteSequence,
) => {
  const formNoteSequence = form.watch();

  const localNoteSequence = useMemo(() => {
    return {
      ...noteSequence,
      ...formNoteSequence,
      tempo: parseInt(formNoteSequence.tempo),
      Notes: formNoteSequence.notes.map((note) => ({
        ...note,
        durationInTicks: parseInt(note.durationInTicks),
        startTimeInTicks: parseInt(note.startTimeInTicks),
        velocity: parseInt(note.velocity),
        noteNumber: parseInt(note.noteNumber),
      })),
    } satisfies NoteSequence;
  }, [noteSequence, formNoteSequence]);

  return usePlayback(localNoteSequence);
};
