import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMusicAtlas } from '@/contexts/MusicAtlasContext';

export const useDeleteNoteSequence = () => {
  const musicAtlas = useMusicAtlas();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      musicAtlas.noteSequences.deleteNoteSequencesById(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['noteSequences'] });
      queryClient.removeQueries({ queryKey: ['noteSequence', id] });
    },
  });
};
