import { useFormContext } from 'react-hook-form';
import { usePrevious, useUpdateEffect } from 'react-use';
import { NoteRow } from './NoteRow';
import { NoteSequenceFormValues } from './types';

export const NoteRowsField = ({
  addNote,
  moveNote,
  playNote,
  deleteNote,
  activeNoteIds,
}: {
  addNote: (afterIndex?: number) => void;
  moveNote: (fromIndex: number, toIndex: number) => void;
  playNote: (noteNumber: number) => void;
  deleteNote: (index: number) => void;
  activeNoteIds: string[];
}) => {
  const { watch, register } = useFormContext<NoteSequenceFormValues>();
  const notes = watch('notes');
  const previousNotes = usePrevious(notes);

  useUpdateEffect(() => {
    // if we just added a note, scroll to the first different one
    if (previousNotes && notes.length > previousNotes.length) {
      const length = Math.max(notes.length, previousNotes.length);
      let index = 0;

      for (let i = 0; i < length; i++) {
        const note = notes.at(i);
        const previousNote = previousNotes?.at(i);

        if (note?.noteNumber !== previousNote?.noteNumber) {
          index = i;
          break;
        }
      }

      setTimeout(() => {
        const noteId = notes[index].id;
        const noteElement = document.getElementById(noteId);

        if (noteElement) {
          noteElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 100);
    }
  }, [notes, previousNotes]);

  if (!notes.length) {
    return (
      <div className="border-b py-4 text-center text-muted-foreground">
        No notes added yet. Click &quot;Add Note&quot; to create your first
        note.
      </div>
    );
  }

  return (
    <>
      {notes.map((note, index) => (
        <NoteRow
          key={note.id}
          activeNoteIds={activeNoteIds}
          addNote={addNote}
          deleteNote={deleteNote}
          id={note.id}
          index={index}
          isFirst={index === 0}
          isLast={index === notes.length - 1}
          moveNote={moveNote}
          playNote={playNote}
          register={register}
        />
      ))}
    </>
  );
};
