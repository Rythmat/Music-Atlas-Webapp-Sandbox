import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { FullScreenLoading } from '@/components/FullScreenLoading';
import { ClassroomRoutes } from '@/constants/routes';
import { AppContext } from '@/contexts/AppContext';
import { ProtectedPage } from '@/contexts/AuthContext';

const ClassroomCollectionPage = lazy(() =>
  import('./ClassroomCollectionPage').then(({ ClassroomCollectionPage }) => ({
    default: ClassroomCollectionPage,
  })),
);

const ClassroomLessonPage = lazy(() =>
  import('./ClassroomLessonPage').then(({ ClassroomLessonPage }) => ({
    default: ClassroomLessonPage,
  })),
);

const ClassroomPickerPage = lazy(() =>
  import('./ClassroomPickerPage').then(({ ClassroomPickerPage }) => ({
    default: ClassroomPickerPage,
  })),
);

const ClassroomHomePage = lazy(() =>
  import('./ClassroomHomePage').then(({ ClassroomHomePage }) => ({
    default: ClassroomHomePage,
  })),
);

export const classroomPages = () => {
  return {
    path: ClassroomRoutes.root.definition,
    element: (
      <AppContext>
        <ProtectedPage>
          <Suspense fallback={<FullScreenLoading />}>
            <Outlet />
          </Suspense>
        </ProtectedPage>
      </AppContext>
    ),
    children: [
      {
        path: ClassroomRoutes.root.definition,
        element: <Navigate to={ClassroomRoutes.picker()} />,
      },
      {
        element: <ClassroomPickerPage />,
        index: true,
      },
      {
        path: ClassroomRoutes.home.definition,
        element: <ClassroomHomePage />,
      },
      {
        path: ClassroomRoutes.collection.definition,
        element: <ClassroomCollectionPage />,
      },
      {
        path: ClassroomRoutes.lesson.definition,
        element: <ClassroomLessonPage />,
      },
      {
        path: '*',
        element: <Navigate to={ClassroomRoutes.picker()} />,
      },
    ],
  };
};
