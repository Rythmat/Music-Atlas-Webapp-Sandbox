import { ArrowLeftIcon, TrashIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminRoutes } from '@/constants/routes';
import { useNavigationContext } from '@/contexts/NavigationContext';
import { useNoteSequence, useDeleteNoteSequence } from '@/hooks/data';
import { NoteSequenceEditor } from './components/NoteSequenceEditor/NoteSequenceEditor';

export const NoteSequencePage = () => {
  const { id: noteSequenceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setTitle, setBreadcrumbs } = useNavigationContext();
  const {
    data: noteSequence,
    isLoading,
    error,
  } = useNoteSequence(noteSequenceId || '');
  const deleteNoteSequence = useDeleteNoteSequence();

  useEffect(() => {
    if (noteSequence) {
      setTitle(`Editing: ${noteSequence.name}`);
      setBreadcrumbs([
        { title: 'Note Sequences', pathname: AdminRoutes.noteSequences() },
        {
          title: noteSequence.name,
          pathname: AdminRoutes.noteSequence({ id: noteSequence.id }),
        },
      ]);
    } else {
      setTitle('Note Sequence');
      setBreadcrumbs([
        { title: 'Note Sequences', pathname: AdminRoutes.noteSequences() },
        { title: 'Loading...', pathname: '#' },
      ]);
    }
  }, [noteSequence, setTitle, setBreadcrumbs]);

  const handleDelete = async () => {
    if (!noteSequenceId) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${noteSequence?.name}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteNoteSequence.mutateAsync(noteSequenceId);
      toast.success('Note sequence deleted successfully');
      navigate(AdminRoutes.noteSequences());
    } catch (error) {
      toast.error('Failed to delete note sequence');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate(AdminRoutes.noteSequences())}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-bottom py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate(AdminRoutes.noteSequences())}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>
            Failed to load note sequence. It may have been deleted or you
            don&apos;t have permission to view it.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => navigate(AdminRoutes.noteSequences())}
          >
            Back to Note Sequences
          </Button>
        </div>
      </div>
    );
  }

  if (!noteSequence) {
    return (
      <div className="container py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate(AdminRoutes.noteSequences())}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <h1 className="text-3xl font-bold">Not found</h1>
        </div>
        <div className="rounded-md bg-zinc-100 p-4 text-zinc-900">
          <p>
            The note sequence you are looking for does not exist. It may have
            been deleted or you don&apos;t have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate(AdminRoutes.noteSequences())}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <h1 className="text-3xl font-bold">{noteSequence.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={deleteNoteSequence.isPending}
            variant="destructive"
            onClick={handleDelete}
          >
            <TrashIcon className="mr-2 size-4" />
            {deleteNoteSequence.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)] flex-col">
        <NoteSequenceEditor
          className="h-full flex-1 overflow-auto"
          noteSequence={noteSequence}
        />
      </div>
    </div>
  );
};
