import { useFormContext } from 'react-hook-form';
import * as Tone from 'tone';
import { NoteSequenceFormValues } from './types';

export const NoteName = ({
  fieldName,
  playNote,
}: {
  fieldName: `notes.${number}.noteNumber`;
  playNote: (noteNumber: number) => void;
}) => {
  const { watch } = useFormContext<NoteSequenceFormValues>();
  const noteNumber = watch(fieldName);

  return (
    <button
      className="text-left hover:text-primary hover:underline focus:outline-none"
      title="Click to play this note"
      onClick={() => playNote(parseInt(noteNumber))}
    >
      {noteNumber ? Tone.Frequency(parseInt(noteNumber), 'midi').toNote() : ''}
    </button>
  );
};
