import { ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DeleteIcon } from '@/components/ui/icons/delete-icon';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipArrow,
} from '@/components/ui/tooltip';
import { cn } from '@/components/utilities';
import { NoteColorInput } from './NoteColorInput';
import { NoteName } from './NoteName';
import { NotePlayingIndicator } from './NotePlayingIndicator';
import { PlayNoteButton } from './PlayNoteButton';
import { NoteSequenceFormValues } from './types';

export const NoteRow = ({
  id,
  index,
  register,
  addNote,
  moveNote,
  playNote,
  deleteNote,
  activeNoteIds,
  // isFirst,
  isLast,
}: {
  id: string;
  index: number;
  activeNoteIds: string[];
  register: UseFormRegister<NoteSequenceFormValues>;
  addNote: (afterIndex?: number) => void;
  moveNote: (fromIndex: number, toIndex: number) => void;
  playNote: (noteNumber: number) => void;
  deleteNote: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}) => {
  return (
    <div
      className={cn(
        'group border-b border-border transition-colors duration-300 hover:bg-muted/50',
      )}
      id={id}
      style={{ display: 'flex', width: '100%' }}
    >
      {/* Note Index & Playing Indicator */}
      <NotePlayingIndicator activeNoteIds={activeNoteIds} index={index} />
      <div
        className="flex items-center p-4 font-mono text-muted-foreground"
        style={{ width: '40px' }}
      >
        {index + 1}
      </div>

      {/* Note Color Picker */}
      <div className="flex items-center p-4" style={{ width: '80px' }}>
        <NoteColorInput fieldName={`notes.${index}.color`} />
      </div>

      {/* Note Name Display */}
      <div className="flex items-center p-4" style={{ width: '80px' }}>
        <NoteName fieldName={`notes.${index}.noteNumber`} playNote={playNote} />
      </div>

      {/* Note Number Input & Play Button */}
      <div className="flex items-center p-4" style={{ width: '160px' }}>
        <div className="flex items-center">
          <Input
            className="w-20"
            max={127}
            min={0}
            type="number"
            {...register(`notes.${index}.noteNumber`)}
          />
          <PlayNoteButton
            fieldName={`notes.${index}.noteNumber`}
            playNote={playNote}
          />
        </div>
      </div>

      {/* Start Time Input */}
      <div className="flex items-center p-4" style={{ width: '120px' }}>
        <Input
          className="w-24"
          min={0}
          type="number"
          {...register(`notes.${index}.startTimeInTicks`)}
        />
      </div>

      {/* Duration Input */}
      <div className="flex items-center p-4" style={{ width: '120px' }}>
        <Input
          className="w-24"
          min={1}
          type="number"
          {...register(`notes.${index}.durationInTicks`)}
        />
      </div>

      {/* Delete Button */}
      <div className="flex items-center p-4" style={{ width: '80px' }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteNote(index)}
            >
              <DeleteIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <TooltipArrow className="text-primary" />
            Delete Note
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Note Navigation Controls */}
      <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
        <div className="grid grid-cols-2 gap-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="size-6"
                disabled={index === 0}
                size="icon"
                variant="ghost"
                onClick={() => moveNote(index, index - 1)}
              >
                <ArrowUp className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <TooltipArrow className="text-primary" />
              Move Note Up
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="size-6 rounded-t-none border-t border-black"
                size="icon"
                variant="ghost"
                onClick={() => addNote(index - 1)}
              >
                <Plus className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <TooltipArrow className="text-primary" />
              Add Note Above
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="size-6"
                disabled={isLast}
                size="icon"
                variant="ghost"
                onClick={() => moveNote(index, index + 1)}
              >
                <ArrowDown className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <TooltipArrow className="text-primary" />
              Move Note Down
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="size-6 rounded-b-none border-b border-black"
                size="icon"
                variant="ghost"
                onClick={() => addNote(index)}
              >
                <Plus className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <TooltipArrow className="text-primary" />
              Add Note Below
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
