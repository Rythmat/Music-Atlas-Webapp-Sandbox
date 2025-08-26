import { useState, useMemo } from 'react';
import { GetNoteSequencesByIdData } from '@/contexts/MusicAtlasContext/musicAtlas.generated';
import { NoteSequenceRow } from './NoteSequenceRow';

interface NoteSequenceListProps {
  noteSequences: GetNoteSequencesByIdData[];
}

export const NoteSequenceList = ({ noteSequences }: NoteSequenceListProps) => {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => [...prev, id]);
  };

  const filteredNoteSequences = useMemo(() => {
    return noteSequences.filter((seq) => !deletedIds.includes(seq.id));
  }, [noteSequences, deletedIds]);

  return (
    <div className="space-y-4">
      <div className="rounded-md">
        <div className="grid grid-cols-12 gap-4 border-b p-4 font-medium">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Tempo</div>
          <div className="col-span-2">Notes</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-1">Actions</div>
        </div>

        <div className="divide-y">
          {filteredNoteSequences.map((noteSequence) => (
            <NoteSequenceRow
              key={noteSequence.id}
              noteSequence={noteSequence}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
