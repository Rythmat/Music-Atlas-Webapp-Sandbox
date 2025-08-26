import { Pause, Play, Plus } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as Tone from 'tone';
import { v4 as uuidv4 } from 'uuid';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/components/utilities';
import {
  GetNoteSequencesByIdData,
  PatchNoteSequencesByIdPayload,
} from '@/contexts/MusicAtlasContext';
import { useUpdateNoteSequence } from '@/hooks/data';
import { useSynth } from '@/hooks/useSynth';
import { NoteRowsField } from './NoteRowsField';
import { NoteTableHeader } from './NoteTableHeader';
import { NoteSequenceFormValues } from './types';
import { useDebouncedAutosave } from './useDebouncedAutosave';
import { useNoteSequencePlayback } from './useNoteSequencePlayback';

type NoteSequenceEditorProps = {
  noteSequence: GetNoteSequencesByIdData;
  className?: string;
};

export const NoteSequenceEditor = ({
  noteSequence,
  className,
}: NoteSequenceEditorProps) => {
  const { mutate: updateNoteSequence } = useUpdateNoteSequence();

  const form = useForm<NoteSequenceFormValues>({
    defaultValues: {
      id: noteSequence.id,
      tempo: noteSequence.tempo.toString(),
      timeSignature: noteSequence.timeSignature,
      notes: noteSequence.Notes.map((note) => ({
        ...note,
        noteNumber: note.noteNumber.toString(),
        durationInTicks: note.durationInTicks.toString(),
        startTimeInTicks: note.startTimeInTicks.toString(),
        velocity: note.velocity.toString(),
      })),
    },
  });

  const handleSave = useCallback(
    async (data: PatchNoteSequencesByIdPayload) => {
      updateNoteSequence(data);
    },
    [updateNoteSequence],
  );

  useDebouncedAutosave(form, handleSave);

  const { isPlaying, activeEvents, play, stop } = useNoteSequencePlayback(
    form,
    noteSequence,
  );

  // Create a map of currently playing note IDs for highlighting
  const activeNoteIds = useMemo(
    () => activeEvents.map((event) => event.id),
    [activeEvents],
  );

  // Add a new note
  const addFullNote = useCallback(
    (params?: { afterIndex?: number; noteNumber?: number }) => {
      const { afterIndex, noteNumber = 60 } = params ?? {};
      // Find the highest startTimeInTicks to place the new note after the last one
      const notes = form.getValues('notes');

      const startTime = parseInt(
        notes.at(afterIndex ?? notes.length - 1)?.startTimeInTicks ?? '0',
      );

      const newNote = {
        id: uuidv4(),
        noteNumber: noteNumber.toString(),
        startTimeInTicks: (startTime + noteSequence.ticksPerBeat).toString(),
        durationInTicks: noteSequence.ticksPerBeat.toString(),
        velocity: '100',
        noteOffVelocity: null,
        noteSequenceId: noteSequence.id,
        color: null,
      } satisfies NoteSequenceFormValues['notes'][number];

      const nextValue = [...notes];

      if (afterIndex !== undefined) {
        nextValue.splice(afterIndex + 1, 0, newNote);
      } else {
        nextValue.push(newNote);
      }

      form.setValue('notes', nextValue);
    },
    [form, noteSequence.id, noteSequence.ticksPerBeat],
  );

  const addNote = useCallback(
    (afterIndex?: number) => {
      addFullNote({ afterIndex });
    },
    [addFullNote],
  );

  const addFromKeyboard = useCallback(
    (noteNumber: number) => {
      addFullNote({ noteNumber });
    },
    [addFullNote],
  );

  const moveNote = useCallback(
    (fromIndex: number, toIndex: number) => {
      const notes = form.getValues('notes');
      const nextValue = [...notes];
      const [removedNote] = nextValue.splice(fromIndex, 1);
      nextValue.splice(toIndex, 0, removedNote);
      form.setValue('notes', nextValue);
    },
    [form],
  );

  // Delete a note
  const deleteNote = useCallback(
    (index: number) => {
      const notes = form.getValues('notes');
      const nextValue = [...notes];
      nextValue.splice(index, 1);
      form.setValue('notes', nextValue);
    },
    [form],
  );

  const getSynth = useSynth();
  // Play a single note - simplified, uses Tone directly just for preview
  const playNote = useCallback(
    (midiNumber: number) => {
      getSynth().triggerAttackRelease(
        Tone.Frequency(midiNumber, 'midi').toNote(),
        0.5,
      );
    },
    [getSynth],
  );

  // Toggle play/pause with the usePlayback hook
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stop({ pause: false });
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  const resetStartTimes = useCallback(() => {
    const notes = form.getValues('notes');

    let prevStartTime = 0;
    const nextValue = notes.map((note, index) => {
      const nextStartTime =
        index === 0 ? 0 : prevStartTime + noteSequence.ticksPerBeat;

      prevStartTime = nextStartTime;

      return {
        ...note,
        startTimeInTicks: nextStartTime.toString(),
      };
    });

    form.setValue('notes', nextValue);
  }, [form, noteSequence.ticksPerBeat]);

  return (
    <FormProvider {...form}>
      <div className={cn('flex size-full flex-col', className)}>
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center space-x-4">
            <Button
              size="icon"
              title={isPlaying ? 'Stop' : 'Play'}
              variant="outline"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Label htmlFor="tempo">Tempo (BPM):</Label>
              <Input
                className="w-20"
                id="tempo"
                max={300}
                min={20}
                type="number"
                {...form.register('tempo')}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="timeSignature">Time Signature:</Label>
              <Input
                className="w-20"
                id="timeSignature"
                type="text"
                {...form.register('timeSignature')}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              title="Reset Start Times"
              variant="outline"
              onClick={resetStartTimes}
            >
              Reset Start Times
            </Button>
            <Button
              title="Add Note"
              variant="outline"
              onClick={() => addNote()}
            >
              <Plus className="mr-2 size-4" />
              Add Note
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="w-full">
            <div className="border-b">
              <div className="flex w-full">
                <NoteTableHeader width="40px">#</NoteTableHeader>
                <NoteTableHeader width="80px">Color</NoteTableHeader>
                <NoteTableHeader width="80px">Note</NoteTableHeader>
                <NoteTableHeader width="160px">MIDI Number</NoteTableHeader>
                <NoteTableHeader width="120px">Start Time</NoteTableHeader>
                <NoteTableHeader width="120px">Duration</NoteTableHeader>
                <div
                  className="h-8 px-4 text-left align-middle text-muted-foreground"
                  style={{ width: '80px' }}
                >
                  Actions
                </div>
              </div>
            </div>
          </div>

          <NoteRowsField
            activeNoteIds={activeNoteIds}
            addNote={addNote}
            deleteNote={deleteNote}
            moveNote={moveNote}
            playNote={playNote}
          />
        </div>

        {/* Floating Piano Keyboard */}
        <div className="sticky bottom-0 mx-auto flex h-24 max-w-4xl shrink-0 items-center justify-center overflow-auto rounded-lg bg-background p-4">
          <PianoKeyboard
            playingNotes={activeEvents}
            onKeyClick={isPlaying ? undefined : addFromKeyboard}
          />
        </div>
      </div>
    </FormProvider>
  );
};
