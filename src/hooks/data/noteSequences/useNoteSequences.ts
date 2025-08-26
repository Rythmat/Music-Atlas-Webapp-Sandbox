import { useInfiniteQuery } from '@tanstack/react-query';
import { useMusicAtlas } from '@/contexts/MusicAtlasContext';

export const useNoteSequences = (name?: string | null) => {
  const musicAtlas = useMusicAtlas();

  return useInfiniteQuery({
    queryKey: ['noteSequences', name],
    queryFn: async ({ pageParam = 0 }) =>
      musicAtlas.noteSequences.getNoteSequences({
        page: pageParam,
        pageSize: 10,
        name: name ?? undefined,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
};
