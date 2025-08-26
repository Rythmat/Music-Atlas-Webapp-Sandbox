import { useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useUpdateEffect } from 'react-use';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { useTune } from '@/hooks/data';
import { MeasureViewer } from './MeasureViewer';
import { MeasuresField } from './MeasuresField';
import { MidiAwareKeyboard } from './MidiAwareKeyboard';
import { TuneAutosave } from './TuneAutosave';
import { handleBeatUnitChange } from './helpers';
import { TuneEditorFormValues } from './types';

export const TuneEditor = ({ tuneId }: { tuneId: string }) => {
  const isTuneStateInitialized = useRef(false);
  const { data: tune, isLoading, error } = useTune({ id: tuneId });

  const form = useForm<TuneEditorFormValues>({
    defaultValues: {
      title: tune?.title ?? 'Untitled tune',
      color: tune?.color ?? null,
      tempo: tune?.tempo?.toString() ?? '120',
      beatsPerMeasure: tune?.beatsPerMeasure?.toString() ?? '4',
      beatUnit: tune?.beatUnit?.toString() ?? '1',
      Measures:
        tune?.Measures?.map((measure) => ({
          id: measure.id,
          label: measure.label ?? null,
          color: measure.color ?? null,
          Notes: measure.Notes.map((note) => ({
            id: note.id,
            label: note.label ?? null,
            color: note.color ?? null,
            pitch: note.pitch ?? null,
            startOffsetInBeats: note.startOffsetInBeats.toString() ?? '0',
            type: note.type ?? 'quarter',
            velocity: note.velocity?.toString() ?? '0',
          })),
        })) ?? [],
    },
  });

  useUpdateEffect(() => {
    if (!isTuneStateInitialized.current) {
      isTuneStateInitialized.current = true;
      form.setValue('title', tune?.title ?? 'Untitled tune');
      form.setValue('color', tune?.color ?? null);
      form.setValue('tempo', tune?.tempo?.toString() ?? '120');
      form.setValue(
        'beatsPerMeasure',
        tune?.beatsPerMeasure?.toString() ?? '4',
      );
      form.setValue('beatUnit', tune?.beatUnit?.toString() ?? '1');
      form.setValue(
        'Measures',
        tune?.Measures?.map((measure) => ({
          id: measure.id,
          label: measure.label ?? null,
          color: measure.color ?? null,
          repeatEnd: measure.repeatEnd,
          repeatStart: measure.repeatStart,
          repeatTimes: measure.repeatTimes?.toString() ?? null,
          number: measure.number.toString(),
          Notes: measure.Notes.map((note) => ({
            id: note.id,
            label: note.label ?? null,
            color: note.color ?? null,
            pitch: note.pitch ?? null,
            startOffsetInBeats: note.startOffsetInBeats.toString() ?? '0',
            type: note.type ?? 'quarter',
            velocity: note.velocity?.toString() ?? '0',
          })),
        })) ?? [],
      );
    }
  }, [tune]);

  const color = form.watch('color');
  const measures = form.watch('Measures');
  const beatsPerMeasure = form.watch('beatsPerMeasure');
  const beatUnit = form.watch('beatUnit');

  return (
    <FormProvider {...form}>
      <TuneAutosave tuneId={tuneId} />
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tune Editor</h1>
        </div>

        {isLoading && <div className="flex justify-center p-8">Loading...</div>}
        {error && <div className="text-red-500">Error: {error.message}</div>}

        {/* Tune Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Tune Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Color</label>
              <ColorPicker
                value={color}
                onChange={(color) => form.setValue('color', color)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="title">
                Title
              </label>
              <Input
                id="title"
                placeholder="Tune title"
                {...form.register('title')}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="tempo">
                Tempo (BPM)
              </label>
              <Input
                className="w-32"
                id="tempo"
                max={300}
                min={1}
                placeholder="Tempo"
                step={1}
                type="number"
                {...form.register('tempo')}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Time Signature
              </label>
              <div className="flex items-center gap-2">
                <Input
                  className="w-24"
                  max={16}
                  min={1}
                  placeholder="Beats"
                  step={1}
                  type="number"
                  {...form.register('beatsPerMeasure')}
                  onChange={(e) => {
                    form.setValue(
                      'beatsPerMeasure',
                      Math.floor(
                        Math.max(1, Math.min(32, Number(e.target.value))),
                      ).toString(),
                    );
                  }}
                />
                <span className="text-xl"> / </span>
                <Input
                  className="w-24"
                  max={32}
                  min={1}
                  placeholder="Beat Unit"
                  step={1}
                  type="number"
                  {...form.register('beatUnit')}
                  onChange={(e) => {
                    const newBeatUnit = handleBeatUnitChange(
                      e.target.value,
                      form.getValues('beatUnit') ?? '4',
                    );
                    form.setValue('beatUnit', newBeatUnit.toString());
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measure Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Measure Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <MeasureViewer
              beatsPerMeasure={beatsPerMeasure ?? '4'}
              beatUnit={beatUnit ?? '4'}
              color={color ?? '#000000'}
              measures={measures}
            />
          </CardContent>
        </Card>

        {/* Piano Keyboard connected to MIDI input */}
        <Card>
          <CardHeader>
            <CardTitle>MIDI Input</CardTitle>
          </CardHeader>
          <CardContent>
            <MidiAwareKeyboard />
          </CardContent>
        </Card>

        {/* Measures */}
        <Card>
          <CardHeader>
            <CardTitle>Measures & Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <MeasuresField />
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
};
