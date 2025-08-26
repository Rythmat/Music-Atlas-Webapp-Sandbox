import { useFormContext } from 'react-hook-form';
import { ColorPicker } from '@/components/ui/color-picker';
import { TuneEditorFormValues } from './types';

export const ColorField = ({
  fieldName,
}: {
  fieldName:
    | 'color'
    | `Measures.${number}.color`
    | `Measures.${number}.Notes.${number}.color`;
}) => {
  const form = useFormContext<TuneEditorFormValues>();

  const color = form.watch(fieldName);

  return (
    <div>
      <ColorPicker
        value={color}
        onChange={(color) => form.setValue(fieldName, color)}
      />
    </div>
  );
};
