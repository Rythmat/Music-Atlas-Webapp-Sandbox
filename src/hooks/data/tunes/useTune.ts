import { useQuery } from '@tanstack/react-query';
import { Tunes, useMusicAtlas } from '@/contexts/MusicAtlasContext';

/**
 * Hook to fetch a tune by id
 */
export const useTune = ({ id }: { id: string }) => {
  const musicAtlas = useMusicAtlas();

  return useQuery({
    queryKey: ['tune', id],
    queryFn: async () => {
      try {
        return await musicAtlas.tunes.getTunesById(id);
      } catch (error) {
        console.error('Error fetching tune:', error);
        throw error;
      }
    },
  });
};

export type Tune = Tunes.GetTunesById.ResponseBody;
export type Measure = Tune['Measures'][number];
export type Note = Measure['Notes'][number];
export type NoteType = Note['type'];
