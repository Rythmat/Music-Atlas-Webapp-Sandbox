import { debounce } from 'lodash';
import hash from 'object-hash';
import { useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PatchNoteSequencesByIdPayload } from '@/contexts/MusicAtlasContext';
import { NoteSequenceFormValues } from './types';

export const useDebouncedAutosave = (
  form: UseFormReturn<NoteSequenceFormValues>,
  saveFn: (data: PatchNoteSequencesByIdPayload) => void,
  debounceTime = 1000,
) => {
  const { watch } = form;

  const data = watch();
  const debouncedSave = useMemo(
    () => debounce(saveFn, debounceTime),
    [saveFn, debounceTime],
  );

  const noteHash = useMemo(() => {
    return hash(data);
  }, [data]);

  useEffect(() => {
    debouncedSave({
      id: data.id,
      tempo: parseInt(data.tempo),
      timeSignature: data.timeSignature,
      notes: data.notes.map((note) => ({
        id: note.id,
        velocity: parseInt(note.velocity),
        durationInTicks: parseInt(note.durationInTicks),
        noteNumber: parseInt(note.noteNumber),
        startTimeInTicks: parseInt(note.startTimeInTicks),
        noteOffVelocity: 0,
        color: note.color,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSave,
    data.notes.length,
    data.tempo,
    data.timeSignature,
    noteHash,
  ]);
};
