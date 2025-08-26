import { useMemo } from 'react';
import { cn } from '@/components/utilities';
import { getNoteDuration } from './helpers';
import { TuneEditorFormValues } from './types';

// Helper to determine note width based on duration
const getNoteWidth = (duration: number, beatsPerMeasure: number) => {
  return (duration / beatsPerMeasure) * 100;
};

// Helper to determine grid divisions based on time signature
const timeSignatureToGridDivisions = (
  beatsPerMeasure: number,
  beatUnit: number,
) => {
  // For common time signatures, use appropriate divisions
  if (beatUnit === 4) {
    // Quarter note gets the beat (4/4, 3/4, etc.)
    return beatsPerMeasure;
  } else if (beatUnit === 8) {
    // Eighth note gets the beat (6/8, 9/8, etc.)
    // Group by 3 for compound meters
    return beatsPerMeasure % 3 === 0 ? beatsPerMeasure / 3 : beatsPerMeasure;
  } else if (beatUnit === 2) {
    // Half note gets the beat (2/2, 3/2, etc.)
    return beatsPerMeasure * 2;
  } else if (beatUnit === 16) {
    // Sixteenth note gets the beat
    return Math.ceil(beatsPerMeasure / 4);
  }

  // Default to beatsPerMeasure
  return beatsPerMeasure;
};

// Helper to get a display name for the beat unit
const getBeatUnitName = (beatUnit: number) => {
  switch (beatUnit) {
    case 1:
      return 'whole note';
    case 2:
      return 'half note';
    case 4:
      return 'quarter note';
    case 8:
      return 'eighth note';
    case 16:
      return 'sixteenth note';
    case 32:
      return 'thirty-second note';
    default:
      return `beat (${beatUnit})`;
  }
};

export const MeasureViewer = ({
  measures,
  beatsPerMeasure,
  beatUnit,
  color,
}: {
  measures: TuneEditorFormValues['Measures'];
  beatsPerMeasure: string;
  beatUnit: string;
  color: string;
}) => {
  const beatsPerMeasureNum = useMemo(
    () => parseInt(beatsPerMeasure, 10) || 4,
    [beatsPerMeasure],
  );
  const beatUnitNum = useMemo(() => parseInt(beatUnit, 10) || 4, [beatUnit]);

  // Calculate grid divisions based on time signature
  const gridDivisions = useMemo(
    () => timeSignatureToGridDivisions(beatsPerMeasureNum, beatUnitNum),
    [beatsPerMeasureNum, beatUnitNum],
  );

  if (!measures || measures.length === 0) {
    return (
      <div className="w-full rounded-md border border-dashed border-gray-300 p-6 text-center">
        <p className="text-sm text-gray-500">No measures added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {measures.map((measure, measureIndex) => (
          <div
            key={measure.id}
            className="w-full rounded-md border border-slate-200 p-2"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">
                {measure.label || `Measure ${measureIndex + 1}`}
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-gray-500">
                  {beatsPerMeasureNum}/{beatUnitNum}
                </div>
                <div className="text-xs text-gray-500 opacity-70">
                  {beatsPerMeasureNum} beats, {getBeatUnitName(beatUnitNum)}{' '}
                  gets one beat
                </div>
              </div>
            </div>

            {/* Measure grid */}
            <div className="flex w-full border border-b-0 border-r-0 border-slate-300">
              {Array.from({ length: gridDivisions }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-6 border-r border-slate-300 bg-slate-50',
                    // Add stronger visual cue for main beats
                    index % (gridDivisions / beatsPerMeasureNum) === 0 &&
                      'border-r-2 border-slate-400',
                  )}
                  style={{ width: `${100 / gridDivisions}%` }}
                />
              ))}
            </div>

            {/* Note visualization */}
            <div className="relative flex w-full border-t border-slate-300">
              {measure.Notes.length === 0 ? (
                <div className="flex h-6 w-full items-center justify-center border-b border-l border-slate-300 bg-slate-50">
                  <span className="text-xs text-slate-400">No notes</span>
                </div>
              ) : (
                measure.Notes.map((note) => (
                  <div
                    key={note.id}
                    className="absolute h-6 border-b border-l border-slate-300 transition-colors"
                    style={{
                      width: `${getNoteWidth(getNoteDuration(beatUnitNum, note.type), beatsPerMeasureNum)}%`,
                      backgroundColor:
                        note.color || measure.color || color || undefined,
                      left: `${(parseFloat(note.startOffsetInBeats ?? '0') / beatsPerMeasureNum) * 100}%`,
                    }}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
