import { useQuery } from '@tanstack/react-query';
import { Tunes, useMusicAtlas } from '@/contexts/MusicAtlasContext';

/**
 * Hook to fetch all tunes
 */
export const useTunes = () => {
  const musicAtlas = useMusicAtlas();

  return useQuery({
    queryKey: ['tunes'],
    queryFn: async () => {
      try {
        return await musicAtlas.tunes.getTunes();
      } catch (error) {
        console.error('Error fetching tunes:', error);
        throw error;
      }
    },
  });
};

export type TuneListItem = Tunes.GetTunes.ResponseBody[number];
