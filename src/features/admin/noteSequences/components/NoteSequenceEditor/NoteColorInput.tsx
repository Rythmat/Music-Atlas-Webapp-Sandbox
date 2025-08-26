import { useFormContext } from 'react-hook-form';
import { ColorPicker } from '@/components/ui/color-picker';
import { NoteSequenceFormValues } from './types';

export const NoteColorInput = ({
  fieldName,
}: {
  fieldName: `notes.${number}.color`;
}) => {
  const { watch, setValue } = useFormContext<NoteSequenceFormValues>();
  const color = watch(fieldName);

  return (
    <ColorPicker
      key={fieldName}
      value={color}
      onChange={(value) => setValue(fieldName, value)}
    />
  );
};
