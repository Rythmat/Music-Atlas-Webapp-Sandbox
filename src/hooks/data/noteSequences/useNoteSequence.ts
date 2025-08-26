import { useQuery } from '@tanstack/react-query';
import { useMusicAtlas } from '@/contexts/MusicAtlasContext';
import { NoteSequences } from '@/contexts/MusicAtlasContext/musicAtlas.generated';
export const useNoteSequence = (id: string) => {
  const musicAtlas = useMusicAtlas();

  return useQuery({
    queryKey: ['noteSequence', id],
    queryFn: () => musicAtlas.noteSequences.getNoteSequencesById(id),
    enabled: !!id,
  });
};

export type NoteSequence = NoteSequences.GetNoteSequencesById.ResponseBody;
