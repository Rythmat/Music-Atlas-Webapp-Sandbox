import { useMutation } from '@tanstack/react-query';
import { useMusicAtlas } from '@/contexts/MusicAtlasContext';

export const useDeleteTune = () => {
  const musicAtlas = useMusicAtlas();

  return useMutation({
    mutationFn: (id: string) => musicAtlas.tunes.deleteTunesById(id),
  });
};
