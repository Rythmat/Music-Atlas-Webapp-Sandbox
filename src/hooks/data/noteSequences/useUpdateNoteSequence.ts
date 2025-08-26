import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMusicAtlas } from '@/contexts/MusicAtlasContext';
import { PatchNoteSequencesByIdPayload } from '@/contexts/MusicAtlasContext/musicAtlas.generated';

export const useUpdateNoteSequence = () => {
  const musicAtlas = useMusicAtlas();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: PatchNoteSequencesByIdPayload) =>
      musicAtlas.noteSequences.patchNoteSequencesById(id, { id, ...data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['noteSequence', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['noteSequences'] });
    },
  });
};
