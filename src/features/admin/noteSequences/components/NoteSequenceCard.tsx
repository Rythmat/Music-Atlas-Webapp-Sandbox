import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminRoutes } from '@/constants/routes';
import { GetNoteSequencesByIdData } from '@/contexts/MusicAtlasContext/musicAtlas.generated';
import { useDeleteNoteSequence } from '@/hooks/data';

interface NoteSequenceCardProps {
  noteSequence: GetNoteSequencesByIdData;
}

export const NoteSequenceCard = ({ noteSequence }: NoteSequenceCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteNoteSequence = useDeleteNoteSequence();

  const handleDelete = async () => {
    try {
      await deleteNoteSequence.mutateAsync(noteSequence.id);
      toast.success('Note sequence deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note sequence');
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{noteSequence.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    to={AdminRoutes.noteSequence({
                      id: noteSequence.id,
                    })}
                  >
                    <PencilIcon className="mr-2 size-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <TrashIcon className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>
            {noteSequence.tempo} BPM, {noteSequence.timeSignature}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {noteSequence.Notes.length} notes
          </div>
        </CardContent>
        <CardFooter className="pt-1 text-xs text-muted-foreground">
          Updated{' '}
          {formatDistanceToNow(new Date(noteSequence.updatedAt), {
            addSuffix: true,
          })}
        </CardFooter>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
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
