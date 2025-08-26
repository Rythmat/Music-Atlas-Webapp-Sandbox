import { HiHome, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { Logo } from '@/components/Logo';
import { BetaHelp } from '@/components/ui/beta-help';
import { ChaptersIcon } from '@/components/ui/icons/chapters-icon';
import { CollectionsIcon } from '@/components/ui/icons/collections-icon';
import { NoteIcon } from '@/components/ui/icons/note-icon';
import { PlayAlongIcon } from '@/components/ui/icons/play-along-icon';
import { StudentIcon } from '@/components/ui/icons/student-icon';
import { TeacherIcon } from '@/components/ui/icons/teacher-icon';
import { RhythmIcon } from '@/components/ui/rhythm-icon';
import { cn } from '@/components/utilities';
import { AdminRoutes } from '@/constants/routes';
import { useAuthContext } from '@/contexts/AuthContext/hooks/useAuthContext';
import { ClassroomSwitcher } from '@/features/teacher/components/ClassroomSwitcher';
import { SidebarMainNavItem } from './SidebarMainNavItem';
import { SidebarSecondaryNavItem } from './SidebarSecondaryNavItem';
import { UserWidget } from './UserWidget';
interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const Sidebar = ({
  className,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) => {
  const { role } = useAuthContext();

  const renderNavigation = () => {
    // Admin navigation
    if (role === 'admin') {
      return (
        <ul className="flex flex-1 flex-col gap-y-1 pt-4">
          <SidebarMainNavItem
            icon={<TeacherIcon />}
            isCollapsed={isCollapsed}
            label="Teachers"
            to={AdminRoutes.teachers()}
          />
          <SidebarMainNavItem
            icon={<StudentIcon />}
            isCollapsed={isCollapsed}
            label="Students"
            to={AdminRoutes.students()}
          />
          <SidebarMainNavItem
            icon={<CollectionsIcon />}
            isCollapsed={isCollapsed}
            label="Books"
            to={AdminRoutes.collections()}
          />
          <SidebarMainNavItem
            icon={<ChaptersIcon />}
            isCollapsed={isCollapsed}
            label="Chapters"
            to={AdminRoutes.chapters()}
          />
          <SidebarMainNavItem
            icon={<NoteIcon />}
            isCollapsed={isCollapsed}
            label="Note Sequences"
            to={AdminRoutes.noteSequences()}
          />
          <SidebarMainNavItem
            icon={<RhythmIcon />}
            isCollapsed={isCollapsed}
            label="Rhythm Maps"
            to={AdminRoutes.phraseMaps()}
          />
          <SidebarMainNavItem
            icon={<PlayAlongIcon />}
            isCollapsed={isCollapsed}
            label="Play Along"
            to={AdminRoutes.playAlongs()}
          />
        </ul>
      );
    }

    // Default navigation or teacher without classroom
    return (
      <ul className="flex flex-1 flex-col space-y-1">
        <SidebarMainNavItem
          icon={<HiHome />}
          isCollapsed={isCollapsed}
          label="Overview"
          to={AdminRoutes.root()}
        />
      </ul>
    );
  };

  return (
    <aside
      className={cn(
        'relative flex h-full animate-fade-in-bottom flex-col space-y-4',
        className,
      )}
    >
      <div className="relative z-10 flex flex-1 flex-col space-y-4 p-6 text-gray-800">
        {/* Header */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <Logo className={cn('relative transition-all')} />
            {!isCollapsed && (
              <span className="text-xl font-semibold text-white transition-all">
                Music Atlas
              </span>
            )}
          </div>

          <div className="group pointer-events-none absolute -top-8 right-[-4.5rem] p-8">
            <button
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="pointer-events-auto flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 opacity-0 transition-all duration-200 hover:bg-gray-200 group-hover:opacity-100"
              onClick={onToggleCollapse}
            >
              {isCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
            </button>
          </div>
        </div>

        {/* Classroom switcher for teachers */}
        {role === 'teacher' && !isCollapsed && (
          <div className="mb-4">
            <ClassroomSwitcher />
          </div>
        )}

        {renderNavigation()}

        {!isCollapsed && (
          <>
            <ul className="flex flex-col space-y-1 text-sm">
              <SidebarSecondaryNavItem
                external
                label="Changelog"
                to="https://www.musicatlas.io/policies/change-log"
              />
              <SidebarSecondaryNavItem
                external
                label="Support"
                to="mailto:aaron@musicatlas.io"
              />
              <SidebarSecondaryNavItem
                external
                label="Licensing"
                to="https://www.musicatlas.io/policies/licensing"
              />
              <SidebarSecondaryNavItem
                external
                label="Privacy Policy"
                to="https://www.musicatlas.io/policies/privacy"
              />
              <SidebarSecondaryNavItem
                external
                label="Terms of Use"
                to="https://www.musicatlas.io/policies/terms"
              />
            </ul>
          </>
        )}

        <UserWidget className="z-0 mt-2" isCollapsed={isCollapsed} />

        {!isCollapsed && <BetaHelp />}
      </div>
    </aside>
  );
};
