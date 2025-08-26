import { useMutation } from '@tanstack/react-query';
import { useMusicAtlas } from '@/contexts/MusicAtlasContext';
import { PostTunesPayload } from '@/contexts/MusicAtlasContext/musicAtlas.generated';

export const useCreateTune = () => {
  const musicAtlas = useMusicAtlas();

  return useMutation({
    mutationFn: (data: PostTunesPayload) => musicAtlas.tunes.postTunes(data),
  });
};
