import { cn } from '@/components/utilities';

export const NoteTableHeader = ({
  children,
  className,
  width,
}: {
  children: React.ReactNode;
  className?: string;
  width?: string;
}) => {
  return (
    <div
      className={cn(
        'h-8 pr-4 pl-6 text-left align-middle text-muted-foreground',
        className,
      )}
      style={{ width }}
    >
      {children}
    </div>
  );
};
