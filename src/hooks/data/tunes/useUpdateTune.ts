import { useMutation } from '@tanstack/react-query';
import { useMusicAtlas } from '@/contexts/MusicAtlasContext';
import { PatchTunesByIdPayload } from '@/contexts/MusicAtlasContext/musicAtlas.generated';

export const useUpdateTune = ({ id }: { id: string }) => {
  const musicAtlas = useMusicAtlas();

  return useMutation({
    mutationFn: (data: PatchTunesByIdPayload) =>
      musicAtlas.tunes.patchTunesById(id, data),
  });
};
