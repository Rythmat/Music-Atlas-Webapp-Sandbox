import { SearchIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { GetNoteSequencesByIdData } from '@/contexts/MusicAtlasContext/musicAtlas.generated';
import { useNoteSequences } from '@/hooks/data';
import { PianoPlayer } from './PianoPlayer';

interface SelectNoteSequenceModalProps {
  children: React.ReactNode;
  onSelect: (sequenceId: string) => void;
}

export const SelectNoteSequenceModal = ({
  children,
  onSelect,
}: SelectNoteSequenceModalProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useNoteSequences();

  // Flatten all note sequences from all pages
  const allNoteSequences = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data],
  );

  // Filter note sequences based on search term
  const filteredNoteSequences = useMemo(
    () =>
      allNoteSequences.filter((seq) =>
        seq.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [allNoteSequences, searchTerm],
  );

  const handleSelectSequence = (sequenceId: string) => {
    onSelect(sequenceId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Note Sequence</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search note sequences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-lg text-muted-foreground">
                Loading note sequences...
              </div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-lg text-destructive">
                Error loading note sequences. Please try again.
              </div>
            </div>
          ) : filteredNoteSequences.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-lg text-muted-foreground">
                No note sequences found
              </div>
            </div>
          ) : (
            <div className="max-h-[400px] max-w-[80vw] space-y-4 overflow-y-auto">
              {filteredNoteSequences.map((sequence) => (
                <NoteSequenceCard
                  key={sequence.id}
                  sequence={sequence}
                  onSelect={handleSelectSequence}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface NoteSequenceCardProps {
  sequence: GetNoteSequencesByIdData;
  onSelect: (sequenceId: string) => void;
}

const NoteSequenceCard = ({ sequence, onSelect }: NoteSequenceCardProps) => {
  return (
    <div
      className="cursor-pointer rounded-md border p-4 hover:bg-muted/30"
      onClick={() => onSelect(sequence.id)}
    >
      <div className="mb-2 font-medium">{sequence.name}</div>
      <div className="mb-2 text-sm text-muted-foreground">
        {sequence.tempo} BPM, {sequence.timeSignature} | {sequence.Notes.length}{' '}
        notes
      </div>
      <PianoPlayer showAllNotes noteSequence={sequence} />
    </div>
  );
};
