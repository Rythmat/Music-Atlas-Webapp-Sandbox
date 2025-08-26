import { useFormContext } from 'react-hook-form';
import { cn } from '@/components/utilities';
import { NoteSequenceFormValues } from './types';

export const NotePlayingIndicator = ({
  index,
  activeNoteIds,
}: {
  index: number;
  activeNoteIds: string[];
}) => {
  const { watch } = useFormContext<NoteSequenceFormValues>();
  const noteId = watch(`notes.${index}.id`);

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'size-2 rounded-full bg-primary',
          activeNoteIds.includes(noteId) && 'bg-green-500',
        )}
      />
    </div>
  );
};
