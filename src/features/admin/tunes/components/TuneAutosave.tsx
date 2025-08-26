import { debounce } from 'lodash';
import hash from 'object-hash';
import { useEffect, useMemo, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useUpdateTune } from '@/hooks/data';
import { TuneEditorFormValues } from './types';

export const TuneAutosave = ({ tuneId }: { tuneId: string }) => {
  const { mutate: __updateTune } = useUpdateTune({ id: tuneId });

  const _updateTune = useMemo(
    () =>
      debounce(__updateTune, 1000, {
        leading: false,
        trailing: true,
      }),
    [__updateTune],
  );

  const updateTune = useRef(_updateTune).current;

  const form = useFormContext<TuneEditorFormValues>();
  const values = form.watch();

  const lastHash = useRef<string | null>(hash(values));

  useEffect(() => {
    if (!form.formState.isDirty) {
      return;
    }

    const update = {
      title: values.title,
      beatsPerMeasure: Number(values.beatsPerMeasure),
      beatUnit: Number(values.beatUnit),
      color: values.color,
      measures: values.Measures.map((measure, index) => ({
        id: measure.id,
        label: measure.label,
        color: measure.color,
        repeatEnd: false,
        repeatStart: false,
        repeatTimes: 0,
        number: index + 1,
        notes: measure.Notes.map((note) => ({
          id: note.id,
          label: note.label,
          color: note.color,
          pitch: note.pitch,
          startOffsetInBeats: Number(note.startOffsetInBeats),
          type: note.type,
          velocity: Number(note.velocity),
        })),
      })),
    };

    const updateHash = hash(update);

    if (updateHash !== lastHash.current) {
      lastHash.current = updateHash;
      updateTune(update);
    }
  }, [values, tuneId, updateTune, form.formState.isDirty]);

  return null;
};
