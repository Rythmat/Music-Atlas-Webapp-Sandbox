import { formatDistanceToNow } from 'date-fns';
import { PauseIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { DeleteIcon } from '@/components/ui/icons/delete-icon';
import { EditIcon } from '@/components/ui/icons/edit-icon';
import { PlayIcon } from '@/components/ui/icons/play-icon';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AdminRoutes } from '@/constants/routes';
import { GetNoteSequencesByIdData } from '@/contexts/MusicAtlasContext/musicAtlas.generated';
import { useDeleteNoteSequence } from '@/hooks/data';
import { useNoteSequencePlayer } from '@/hooks/useNoteSequencePlayer';
import { PianoPlayer } from '../../chapters/components/PianoPlayer';
interface NoteSequenceRowProps {
  noteSequence: GetNoteSequencesByIdData;
  onDelete: (id: string) => void;
}

export const NoteSequenceRow = ({
  noteSequence,
  onDelete,
}: NoteSequenceRowProps) => {
  const [togglePlayback, playingState] = useNoteSequencePlayer(noteSequence);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteNoteSequence = useDeleteNoteSequence();

  const handleDelete = async () => {
    try {
      await deleteNoteSequence.mutateAsync(noteSequence.id);
      toast.success('Note sequence deleted successfully');
      onDelete(noteSequence.id);
    } catch (error) {
      toast.error('Failed to delete note sequence');
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/30">
        <div className="col-span-5">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link
                className="font-medium hover:underline"
                to={AdminRoutes.noteSequence({
                  id: noteSequence.id,
                })}
              >
                {noteSequence.name}
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <PianoPlayer showAllNotes noteSequence={noteSequence} />
            </HoverCardContent>
          </HoverCard>
          {playingState.isPlaying && (
            <div className="mt-1">
              <Progress className="h-1" value={playingState.progress * 100} />
            </div>
          )}
        </div>
        <div className="col-span-2">
          {noteSequence.tempo} BPM, {noteSequence.timeSignature}
        </div>
        <div className="col-span-2">{noteSequence.Notes.length} notes</div>
        <div className="col-span-2 text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(noteSequence.updatedAt), {
            addSuffix: true,
          })}
        </div>
        <div className="col-span-1 flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={togglePlayback}>
                  {playingState.isPlaying ? (
                    <PauseIcon className="size-4" />
                  ) : (
                    <PlayIcon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {playingState.isPlaying ? 'Pause' : 'Play'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild size="icon" variant="ghost">
                  <Link
                    to={AdminRoutes.noteSequence({
                      id: noteSequence.id,
                    })}
                  >
                    <EditIcon className="size-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-destructive hover:text-destructive"
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <DeleteIcon className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the note sequence &quot;
              {noteSequence.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {deleteNoteSequence.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
