import { PlusIcon } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorField } from './ColorField';
import { NotesField } from './NotesField';
import { TuneEditorFormValues } from './types';

export const MeasuresField = () => {
  const form = useFormContext<TuneEditorFormValues>();

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'Measures',
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() =>
            append({
              id: uuidv4(),
              label: '',
              color: null,
              Notes: [],
              number: (fields.length + 1).toString(),
              repeatEnd: false,
              repeatStart: false,
              repeatTimes: null,
            })
          }
        >
          <PlusIcon className="mr-1 size-3" />
          Add Measure
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-gray-500">No measures added yet</p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-3 rounded-md border p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    className="h-7 text-sm"
                    placeholder="Measure label (optional)"
                    {...form.register(`Measures.${index}.label`)}
                  />
                </div>
                <div>
                  <ColorField fieldName={`Measures.${index}.color`} />
                </div>
              </div>

              <NotesField measureIndex={index} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
