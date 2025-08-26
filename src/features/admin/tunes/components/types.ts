import { Tune, Measure, TuneNote } from '@/hooks/data';

type NumbersAsStrings<T> = {
  [K in keyof T]: T[K] extends number | null ? string | null : T[K];
};

type FormNote = Omit<TuneNote, 'createdAt' | 'updatedAt' | 'measureId'>;

type FormMeasure = Omit<
  Measure,
  'createdAt' | 'updatedAt' | 'Notes' | 'tuneId'
> & {
  Notes: Array<NumbersAsStrings<FormNote>>;
};

type _TuneEditorFormValues = Omit<
  Tune,
  'createdAt' | 'updatedAt' | 'Measures'
> & {
  Measures: Array<NumbersAsStrings<FormMeasure>>;
};

export type TuneEditorFormValues = NumbersAsStrings<_TuneEditorFormValues>;
