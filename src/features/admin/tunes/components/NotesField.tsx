import { PlusIcon, TrashIcon } from 'lucide-react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorField } from './ColorField';
import { NoteTypeSelect } from './NoteTypeSelect';
import { TuneEditorFormValues } from './types';

const MIN_NOTE_STEP = 0.125;

export const NotesField = ({ measureIndex }: { measureIndex: number }) => {
  const form = useFormContext<TuneEditorFormValues>();

  const {
    fields,
    remove: removeNote,
    append,
  } = useFieldArray({
    control: form.control,
    name: `Measures.${measureIndex}.Notes`,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Notes</h3>
        <Button
          className="h-7 text-xs"
          size="sm"
          variant="outline"
          onClick={() =>
            append({
              id: uuidv4(),
              label: '',
              color: null,
              pitch: '',
              startOffsetInBeats: '0',
              type: 'quarter',
              velocity: '100',
            })
          }
        >
          <PlusIcon className="mr-1 size-3" />
          Add Note
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-gray-500">No notes added yet</p>
      ) : (
        <div className="space-y-1">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-1 px-2 text-xs text-gray-500">
            <div className="col-span-2">Pitch</div>
            <div className="col-span-2">Start</div>
            <div className="col-span-2">Dur.</div>
            <div className="col-span-2">Vel.</div>
            <div className="col-span-3">Color</div>
            <div className="col-span-1"></div>
          </div>

          {/* Note rows */}
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-12 items-center gap-1 rounded-md border bg-slate-50 px-2 py-1"
            >
              <div className="col-span-2">
                <Input
                  className="h-6 px-1 text-xs"
                  placeholder="C4"
                  {...form.register(
                    `Measures.${measureIndex}.Notes.${index}.pitch`,
                  )}
                />
              </div>

              <div className="col-span-2">
                <Input
                  className="h-6 px-1 text-xs"
                  max={16 - MIN_NOTE_STEP}
                  min={MIN_NOTE_STEP}
                  placeholder="0"
                  step={MIN_NOTE_STEP}
                  type="number"
                  {...form.register(
                    `Measures.${measureIndex}.Notes.${index}.startOffsetInBeats`,
                  )}
                />
              </div>

              <div className="col-span-2">
                <NoteTypeSelect
                  fieldName={`Measures.${measureIndex}.Notes.${index}.type`}
                />
              </div>

              <div className="col-span-2">
                <Input
                  className="h-6 px-1 text-xs"
                  max={127}
                  min={0}
                  placeholder="100"
                  step={1}
                  type="number"
                  {...form.register(
                    `Measures.${measureIndex}.Notes.${index}.velocity`,
                  )}
                />
              </div>

              <div className="col-span-3">
                <ColorField
                  fieldName={`Measures.${measureIndex}.Notes.${index}.color`}
                />
              </div>

              <div className="col-span-1 text-right">
                <Button
                  className="size-6 p-0"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeNote(index)}
                >
                  <TrashIcon className="size-3" />
                </Button>
              </div>

              {/* Hidden label field - kept for data structure but not displayed */}
              <input
                type="hidden"
                {...form.register(
                  `Measures.${measureIndex}.Notes.${index}.label`,
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
