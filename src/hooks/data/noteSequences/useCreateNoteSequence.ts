import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMusicAtlas } from '@/contexts/MusicAtlasContext';
import { PostNoteSequencesPayload } from '@/contexts/MusicAtlasContext/musicAtlas.generated';

export const useCreateNoteSequence = () => {
  const musicAtlas = useMusicAtlas();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostNoteSequencesPayload) =>
      musicAtlas.noteSequences.postNoteSequences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noteSequences'] });
    },
  });
};
