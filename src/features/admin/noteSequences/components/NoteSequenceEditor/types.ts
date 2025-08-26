export type NoteSequenceFormValues = {
  id: string;
  tempo: string;
  timeSignature: string;
  notes: {
    color: string | null;
    durationInTicks: string;
    id: string;
    noteNumber: string;
    noteOffVelocity: number | null;
    noteSequenceId: string;
    startTimeInTicks: string;
    velocity: string;
  }[];
};
