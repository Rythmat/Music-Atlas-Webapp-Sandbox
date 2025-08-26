import { Play } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { NoteSequenceFormValues } from './types';

export const PlayNoteButton = ({
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
      className="ml-2 rounded-full p-1 hover:bg-muted"
      title="Play this note"
      onClick={() => playNote(parseInt(noteNumber))}
    >
      <Play className="size-3" />
    </button>
  );
};
