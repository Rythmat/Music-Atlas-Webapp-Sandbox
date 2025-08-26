import { useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TuneNoteType } from '@/hooks/data';
import { TuneEditorFormValues } from './types';

const NOTE_TYPE_OPTIONS: TuneNoteType[] = [
  'whole',
  'half',
  'quarter',
  'eighth',
  'sixteenth',
  'thirtysecond',
  'dotted_whole',
  'dotted_half',
  'dotted_quarter',
  'dotted_eighth',
  'dotted_sixteenth',
];

export const NoteTypeSelect = ({
  fieldName,
}: {
  fieldName: `Measures.${number}.Notes.${number}.type`;
}) => {
  const form = useFormContext<TuneEditorFormValues>();
  const type = form.watch(fieldName);

  return (
    <Select
      value={type}
      onValueChange={(value) => form.setValue(fieldName, value as TuneNoteType)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a type" />
      </SelectTrigger>
      <SelectContent>
        {NOTE_TYPE_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
