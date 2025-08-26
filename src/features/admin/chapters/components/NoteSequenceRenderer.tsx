import { ErrorBox } from '@/components/ErrorBox';
import { useNoteSequence } from '@/hooks/data';
import { PianoPlayer } from './PianoPlayer';
import { PianoPlayerSkeleton } from './PianoPlayerSkeleton';

interface NoteSequenceRendererProps {
  id: string;
  viewType: string; // 'piano' or other view types
  viewMode: string; // 'preview' or 'play_along'
  color?: string;
}

export const NoteSequenceRenderer = ({
  id,
  color,
}: NoteSequenceRendererProps) => {
  const { data: noteSequence, isLoading, error } = useNoteSequence(id);

  if (isLoading) {
    return <PianoPlayerSkeleton />;
  }

  if (error) {
    return <ErrorBox message="Failed to load note sequence" />;
  }

  if (!noteSequence) {
    return <ErrorBox message="Note sequence not found" />;
  }

  return <PianoPlayer showAllNotes color={color} noteSequence={noteSequence} />;
};
