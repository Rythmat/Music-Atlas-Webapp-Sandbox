import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AdminRoutes } from '@/constants/routes';
import { useTunes, useDeleteTune } from '@/hooks/data';
import { CreateTuneModal } from './components/CreateTuneModal';

export const TunesPage = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tuneToDelete, setTuneToDelete] = useState<string | null>(null);

  const tunes = useTunes();
  const deleteTune = useDeleteTune();

  const confirmDelete = useCallback((id: string) => {
    setTuneToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!tuneToDelete) return;

    try {
      await deleteTune.mutateAsync(tuneToDelete);
      // Refresh the list
      await tunes.refetch();
    } catch (error) {
      console.error('Failed to delete tune:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setTuneToDelete(null);
    }
  }, [deleteTune, tuneToDelete, tunes]);

  const handleEdit = useCallback(
    (id: string) => {
      navigate(AdminRoutes.tune({ id }));
    },
    [navigate],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tunes</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Create Tune
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateTuneModal />
          </DialogContent>
        </Dialog>
      </div>

      {tunes.isLoading ? (
        <div className="flex justify-center">
          <p>Loading tunes...</p>
        </div>
      ) : tunes.isError ? (
        <div className="flex justify-center">
          <p className="text-red-500">Error loading tunes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tunes.data?.map((tune) => (
            <Card
              key={tune.id}
              style={{ borderColor: tune.color || undefined }}
            >
              <CardHeader>
                <CardTitle>{tune.title || 'Untitled tune'}</CardTitle>
                <CardDescription>
                  Time Signature: {tune.beatsPerMeasure}/{tune.beatUnit} •
                  Tempo: {tune.tempo} BPM
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <p>Measures: {tune.measures}</p>
                  <p>Notes: {tune.notes}</p>
                  <p>
                    Created: {new Date(tune.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Updated: {new Date(tune.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => confirmDelete(tune.id)}
                >
                  <TrashIcon className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(tune.id)}
                >
                  <PencilIcon className="size-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tune and all its measures and
              notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-red-100"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
