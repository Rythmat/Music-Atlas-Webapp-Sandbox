import { SearchIcon, Loader2 } from 'lucide-react';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NoteIcon } from '@/components/ui/icons/note-icon';
import { Input } from '@/components/ui/input';
import { useNavigationContext } from '@/contexts/NavigationContext';
import { useNoteSequences } from '@/hooks/data';
import { CreateNoteSequenceModal } from './components/CreateNoteSequenceModal';
import { NoteSequenceList } from './components/NoteSequenceList';

export const NoteSequencesPage = () => {
  const { setTitle } = useNavigationContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNoteSequences(debouncedSearchTerm);

  // Flatten all note sequences from all pages
  const allNoteSequences = data?.pages.flatMap((page) => page.data) || [];
  const isEmpty = allNoteSequences.length === 0;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage || !hasNextPage || isEmpty) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isEmpty],
  );

  useEffect(() => {
    setTitle('Note Sequences');
  }, [setTitle]);

  // Clean up the observer when the component unmounts
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="animate-fade-in-bottom rounded-xl bg-surface-box">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Note Sequences</h1>
          <p className="text-muted-foreground">
            View and manage all note sequences in the system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-56 rounded-full pl-10"
              placeholder="Search note sequences"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground">
                <Loader2 className="animate-spin" />
              </div>
            )}
          </div>
          <CreateNoteSequenceModal>
            <Button>Create Note Sequence</Button>
          </CreateNoteSequenceModal>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex h-64 items-center justify-center">
          {searchTerm ? (
            <div className="text-lg text-muted-foreground">
              No note sequences found matching your search criteria
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="mb-2 rounded-full bg-black p-4">
                <NoteIcon className="size-10 text-muted-foreground" />
              </div>
              <p className="text-3xl text-white">No note sequences yet</p>
              <p className="text-muted-foreground">
                Your melody’s missing its motion. Add a note sequence to bring
                it to life.
              </p>
              <CreateNoteSequenceModal>
                <Button className="mt-5">Create my first note sequence</Button>
              </CreateNoteSequenceModal>
            </div>
          )}
        </div>
      ) : (
        <NoteSequenceList noteSequences={allNoteSequences} />
      )}

      {error && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg text-destructive">
            Error loading note sequences. Please try again.
          </div>
        </div>
      )}

      {/* Load more trigger element */}
      <div ref={loadMoreRef} className="mt-8 flex justify-center py-4">
        {isFetchingNextPage ? (
          <div className="text-muted-foreground">Loading more...</div>
        ) : hasNextPage ? (
          <Button variant="outline" onClick={() => fetchNextPage()}>
            Load More
          </Button>
        ) : (
          !isEmpty && (
            <div className="text-muted-foreground">No more note sequences</div>
          )
        )}
      </div>
    </div>
  );
};
