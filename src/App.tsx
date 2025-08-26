import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppContext } from './contexts/AppContext';
import { WildcardPage } from './features/WildcardPage';
import { adminPages } from './features/admin';
import { authPages } from './features/authentication/AuthPages';
import { classroomPages } from './features/classroom/ClassroomPages';
import { legalPages } from './features/legal';
import { teacherPages } from './features/teacher/TeacherPages';

const routesArray = createBrowserRouter([
  authPages(),
  adminPages(),
  classroomPages(),
  teacherPages(),
  legalPages(),
  {
    path: '*',
    element: (
      <AppContext>
        <WildcardPage />
      </AppContext>
    ),
  },
]);

export function App() {
  return <RouterProvider router={routesArray} />;
}
