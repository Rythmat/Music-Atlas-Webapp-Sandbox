import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminRoutes } from '@/constants/routes';
import { AppContext } from '@/contexts/AppContext';
import { ProtectedPage } from '@/contexts/AuthContext';
import {
  DashboardLayout,
  DashboardContentSkeleton,
} from '@/layouts/DashboardLayout';
import { CollectionsPage } from './collections/CollectionsPage';

const StudentManagementPage = lazy(() =>
  import('./StudentManagementPage').then(({ StudentManagementPage }) => ({
    default: StudentManagementPage,
  })),
);

const TeacherManagementPage = lazy(() =>
  import('./TeacherManagementPage').then(({ TeacherManagementPage }) => ({
    default: TeacherManagementPage,
  })),
);

const NoteSequencesPage = lazy(() =>
  import('./noteSequences/NoteSequencesPage').then(({ NoteSequencesPage }) => ({
    default: NoteSequencesPage,
  })),
);

const NoteSequencePage = lazy(() =>
  import('./noteSequences/NoteSequencePage').then(({ NoteSequencePage }) => ({
    default: NoteSequencePage,
  })),
);

const ChaptersPage = lazy(() =>
  import('./chapters/ChaptersPage').then(({ ChaptersPage }) => ({
    default: ChaptersPage,
  })),
);

const ChapterEditorPage = lazy(() =>
  import('./chapters/ChapterEditorPage').then(({ ChapterEditorPage }) => ({
    default: ChapterEditorPage,
  })),
);

const PhraseMapsPage = lazy(() =>
  import('./phraseMaps/PhraseMapsPage').then(({ PhraseMapsPage }) => ({
    default: PhraseMapsPage,
  })),
);

const PhraseMapPage = lazy(() =>
  import('./phraseMaps/PhraseMapPage').then(({ PhraseMapPage }) => ({
    default: PhraseMapPage,
  })),
);

const CollectionEditorPage = lazy(() =>
  import('./collections/CollectionEditorPage').then(
    ({ CollectionEditorPage }) => ({
      default: CollectionEditorPage,
    }),
  ),
);

const PlayAlongsPage = lazy(() =>
  import('./playAlongs/PlayAlongsPage').then(({ PlayAlongsPage }) => ({
    default: PlayAlongsPage,
  })),
);

const PlayAlongPage = lazy(() =>
  import('./playAlongs/PlayAlongPage').then(({ PlayAlongPage }) => ({
    default: PlayAlongPage,
  })),
);

const TunesPage = lazy(() =>
  import('./tunes/TunesPage').then(({ TunesPage }) => ({
    default: TunesPage,
  })),
);

const TunePage = lazy(() =>
  import('./tunes/TunePage').then(({ TunePage }) => ({
    default: TunePage,
  })),
);

export const adminPages = () => {
  return {
    path: AdminRoutes.root.definition,
    element: (
      <AppContext>
        <ProtectedPage adminOnly>
          <DashboardLayout fallback={<DashboardContentSkeleton />} />
        </ProtectedPage>
      </AppContext>
    ),
    children: [
      // Admin routes
      {
        path: AdminRoutes.root.definition,
        element: <Navigate to={AdminRoutes.teachers()} />,
      },
      {
        path: AdminRoutes.noteSequences.definition,
        element: <NoteSequencesPage />,
      },
      {
        path: AdminRoutes.noteSequence.definition,
        element: <NoteSequencePage />,
      },
      {
        path: AdminRoutes.chapters.definition,
        element: <ChaptersPage />,
      },
      {
        path: AdminRoutes.chapter.definition,
        element: <ChapterEditorPage />,
      },
      {
        path: AdminRoutes.collections.definition,
        element: <CollectionsPage />,
      },
      {
        path: AdminRoutes.collection.definition,
        element: <CollectionEditorPage />,
      },
      {
        path: AdminRoutes.students.definition,
        element: <StudentManagementPage />,
      },
      {
        path: AdminRoutes.teachers.definition,
        element: <TeacherManagementPage />,
      },
      {
        path: AdminRoutes.phraseMaps.definition,
        element: <PhraseMapsPage />,
      },
      {
        path: AdminRoutes.phraseMap.definition,
        element: <PhraseMapPage />,
      },
      {
        path: AdminRoutes.playAlongs.definition,
        element: <PlayAlongsPage />,
      },
      {
        path: AdminRoutes.playAlong.definition,
        element: <PlayAlongPage />,
      },
      {
        path: AdminRoutes.tunes.definition,
        element: <TunesPage />,
      },
      {
        path: AdminRoutes.tune.definition,
        element: <TunePage />,
      },
      {
        path: '*',
        element: <Navigate to={AdminRoutes.teachers()} />,
      },
    ],
  };
};
