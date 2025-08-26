import { Midi } from '@tonejs/midi';
import { PauseIcon, PlayIcon, XIcon } from 'lucide-react';
import { useState, useEffect, useRef, MouseEvent } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { PostNoteSequencesPayload } from '@/contexts/MusicAtlasContext/musicAtlas.generated';

interface MidiToNoteSequenceConverterProps {
  file: File;
  onConversionComplete: (noteSequence: PostNoteSequencesPayload) => void;
  onError: (error: Error) => void;
}

interface MidiTrack {
  index: number;
  name: string;
  instrument: string;
  noteCount: number;
}

interface NoteEvent {
  time: number;
  endTime: number;
  midi: number;
  velocity: number;
}

interface ProcessedTrack {
  notes: NoteEvent[];
  startTime: number;
  endTime: number;
  duration: number;
}

export const MidiToNoteSequenceConverter = ({
  file,
  onConversionComplete,
  onError,
}: MidiToNoteSequenceConverterProps) => {
  const [isConverting, setIsConverting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [midiData, setMidiData] = useState<Midi | null>(null);
  const [tracks, setTracks] = useState<MidiTrack[]>([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [seekPosition, setSeekPosition] = useState(0);
  const [originalTrackDuration, setOriginalTrackDuration] = useState(0);
  const [silenceTrimmed, setSilenceTrimmed] = useState({ start: 0, end: 0 });
  const [intervalSelection, setIntervalSelection] = useState<
    [number, number] | null
  >(null);
  // const [selectionStartTime, setSelectionStartTime] = useState(0);
  // const [selectionEndTime, setSelectionEndTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Refs for Tone.js objects
  const synth = useRef<Tone.PolySynth | null>(null);
  const part = useRef<Tone.Part | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const trackEvents = useRef<NoteEvent[]>([]);
  const originalEvents = useRef<NoteEvent[]>([]);

  // Initialize Tone.js synth
  useEffect(() => {
    // Create a polyphonic synth for playing multiple notes simultaneously
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();

    // Clean up when component unmounts
    return () => {
      if (part.current) {
        part.current.dispose();
      }
      if (synth.current) {
        synth.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Parse the MIDI file when it's provided
  useEffect(() => {
    const parseMidiFile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Read the file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Parse the MIDI data
        const midi = new Midi(arrayBuffer);
        setMidiData(midi);

        // Extract track information
        const trackInfo = midi.tracks.map((track, index) => ({
          index,
          name: track.name || `Track ${index + 1}`,
          instrument: track.instrument?.name || 'Unknown',
          noteCount: track.notes.length,
        }));

        // Filter out tracks with no notes
        const tracksWithNotes = trackInfo.filter(
          (track) => track.noteCount > 0,
        );
        setTracks(tracksWithNotes);

        // Auto-select the first track with notes if available
        if (tracksWithNotes.length > 0) {
          setSelectedTrackIndex(tracksWithNotes[0].index.toString());
        }
      } catch (err) {
        setError(
          `Failed to parse MIDI file: ${err instanceof Error ? err.message : String(err)}`,
        );
        onError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    if (file) {
      parseMidiFile();
    }
  }, [file, onError]);

  // Process track to trim silences and apply interval selection
  const processTrack = (trackIndex: number): ProcessedTrack => {
    if (!midiData) {
      return { notes: [], startTime: 0, endTime: 0, duration: 0 };
    }

    const selectedTrack = midiData.tracks[trackIndex];

    // Create an array of note events
    const events = selectedTrack.notes.map((note) => ({
      time: note.time,
      endTime: note.time + note.duration,
      midi: note.midi,
      velocity: note.velocity,
    }));

    // Store original events
    originalEvents.current = [...events];

    // Sort events by time
    const sortedEvents = [...events].sort((a, b) => a.time - b.time);

    if (sortedEvents.length === 0) {
      return {
        notes: sortedEvents,
        startTime: 0,
        endTime: 0,
        duration: 0,
      };
    }

    // Find first note start time and last note end time
    const firstNoteTime = sortedEvents[0].time;
    const lastNoteEndTime = sortedEvents.reduce(
      (max, note) => Math.max(max, note.endTime),
      0,
    );

    // Adjust all note times to remove initial silence
    const trimmedEvents = sortedEvents.map((event) => ({
      ...event,
      time: event.time - firstNoteTime,
      endTime: event.endTime - firstNoteTime,
    }));

    // Calculate new duration after trimming
    const newDuration = lastNoteEndTime - firstNoteTime;

    // Store silence trimming info for display
    setSilenceTrimmed({
      start: firstNoteTime,
      end:
        originalEvents.current.reduce(
          (max, note) => Math.max(max, note.endTime),
          0,
        ) - lastNoteEndTime,
    });

    // Apply interval selection if active
    let processedEvents = trimmedEvents;
    if (intervalSelection) {
      const startTime = (intervalSelection[0] / 100) * newDuration;
      const endTime = (intervalSelection[1] / 100) * newDuration;

      // setSelectionStartTime(startTime);
      // setSelectionEndTime(endTime);

      // Filter notes that fall within the selected interval
      processedEvents = trimmedEvents.filter(
        (event) =>
          (event.time >= startTime && event.time < endTime) ||
          (event.endTime > startTime && event.endTime <= endTime) ||
          (event.time <= startTime && event.endTime >= endTime),
      );

      // Adjust times relative to the new start point
      if (processedEvents.length > 0) {
        processedEvents = processedEvents.map((event) => ({
          ...event,
          time: event.time - startTime,
          endTime: event.endTime - startTime,
        }));
      }

      return {
        notes: processedEvents,
        startTime: firstNoteTime + startTime,
        endTime: firstNoteTime + endTime,
        duration: endTime - startTime,
      };
    }

    return {
      notes: processedEvents,
      startTime: firstNoteTime,
      endTime: lastNoteEndTime,
      duration: newDuration,
    };
  };

  // Update track events and duration when track changes or interval selection changes
  useEffect(() => {
    if (!midiData || selectedTrackIndex === '') return;

    const trackIndex = parseInt(selectedTrackIndex);

    // Process the track (always trim silences)
    const processedTrack = processTrack(trackIndex);

    // Update track events for visualization and playback
    trackEvents.current = processedTrack.notes;

    // Store original duration for comparison
    setOriginalTrackDuration(
      originalEvents.current.reduce(
        (max, note) => Math.max(max, note.endTime),
        0,
      ),
    );

    // Update track duration
    setTrackDuration(processedTrack.duration);
    setCurrentTime(0);
    setSeekPosition(0);

    // Draw the waveform
    drawWaveform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [midiData, selectedTrackIndex, intervalSelection]);

  // Update the current time during playback
  useEffect(() => {
    if (!isPlaying) return;

    const updateTime = () => {
      if (Tone.Transport.state === 'started') {
        const newTime = Tone.Transport.seconds;
        setCurrentTime(newTime);
        setSeekPosition((newTime / trackDuration) * 100);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, trackDuration]);

  // Draw the waveform visualization
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || trackEvents.current.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw interval selection if active
    if (intervalSelection) {
      const startX = (intervalSelection[0] / 100) * rect.width;
      const endX = (intervalSelection[1] / 100) * rect.width;

      // Draw selection background
      ctx.fillStyle = 'rgba(0, 120, 255, 0.1)';
      ctx.fillRect(startX, 0, endX - startX, rect.height);

      // Draw selection borders
      ctx.strokeStyle = 'rgba(0, 120, 255, 0.8)';
      ctx.lineWidth = 2;

      // Start border
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, rect.height);
      ctx.stroke();

      // End border
      ctx.beginPath();
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, rect.height);
      ctx.stroke();
    }

    // Draw dragging selection
    if (isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const currentX = Math.min(Math.max(0, dragStartX), rect.width);
      const mouseX = Math.min(Math.max(0, currentX), rect.width);

      const startX = Math.min(dragStartX, mouseX);
      const endX = Math.max(dragStartX, mouseX);

      // Draw selection background
      ctx.fillStyle = 'rgba(0, 120, 255, 0.1)';
      ctx.fillRect(startX, 0, endX - startX, rect.height);

      // Draw selection borders
      ctx.strokeStyle = 'rgba(0, 120, 255, 0.8)';
      ctx.lineWidth = 2;

      // Start border
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, rect.height);
      ctx.stroke();

      // End border
      ctx.beginPath();
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, rect.height);
      ctx.stroke();
    }

    // Sort events by time
    const events = [...trackEvents.current].sort((a, b) => a.time - b.time);

    // Calculate the maximum MIDI note value for scaling
    const minMidi = Math.min(...events.map((e) => e.midi));
    const maxMidi = Math.max(...events.map((e) => e.midi));
    const midiRange = maxMidi - minMidi + 1;

    // Draw note blocks
    events.forEach((event) => {
      const x = (event.time / trackDuration) * rect.width;
      const width = ((event.endTime - event.time) / trackDuration) * rect.width;

      // Calculate y position based on MIDI note (higher notes at the top)
      const normalizedMidi = (event.midi - minMidi) / midiRange;
      const y =
        rect.height - (normalizedMidi * rect.height * 0.8 + rect.height * 0.1);
      const height = rect.height * 0.05;

      // Color based on velocity
      const hue = 220; // Blue
      const saturation = 80;
      const lightness = 50 + event.velocity * 30; // Brighter for higher velocity

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.fillRect(x, y, width, height);
    });

    // Draw playhead if playing
    if (isPlaying) {
      const playheadX = (currentTime / trackDuration) * rect.width;
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, rect.height);
      ctx.stroke();
    }
  };

  // Redraw waveform when current time changes
  useEffect(() => {
    drawWaveform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  const handleTrackChange = (value: string) => {
    // Stop any playing preview when changing tracks
    stopPlayback();
    setSelectedTrackIndex(value);
  };

  const handleConvert = async () => {
    if (!midiData || selectedTrackIndex === '') return;

    try {
      setIsConverting(true);

      const trackIndex = parseInt(selectedTrackIndex);
      const selectedTrack = midiData.tracks[trackIndex];

      // Process the track to get trimmed notes and apply interval selection
      const processedTrack = processTrack(trackIndex);
      const startTimeOffset = processedTrack.startTime;

      // Get the first time signature if available, otherwise default to 4/4
      const timeSignature =
        midiData.header.timeSignatures.length > 0
          ? `${midiData.header.timeSignatures[0].timeSignature[0]}/${midiData.header.timeSignatures[0].timeSignature[1]}`
          : '4/4';

      // Get the first tempo if available, otherwise default to 120
      const tempo =
        midiData.header.tempos.length > 0
          ? Math.round(midiData.header.tempos[0].bpm)
          : 120;

      // Filter notes based on the interval selection if active
      let notesToConvert = selectedTrack.notes;

      if (intervalSelection) {
        const startTime =
          (intervalSelection[0] / 100) * processedTrack.duration +
          silenceTrimmed.start;
        const endTime =
          (intervalSelection[1] / 100) * processedTrack.duration +
          silenceTrimmed.start;

        notesToConvert = selectedTrack.notes.filter((note) => {
          const noteStart = note.time;
          const noteEnd = note.time + note.duration;
          return (
            (noteStart >= startTime && noteStart < endTime) ||
            (noteEnd > startTime && noteEnd <= endTime) ||
            (noteStart <= startTime && noteEnd >= endTime)
          );
        });
      }

      // Convert notes to the expected format
      const notes = notesToConvert.map((note) => {
        let adjustedStartTicks;

        if (intervalSelection) {
          // If interval selection is active, adjust relative to selection start
          const selectionStartInSeconds =
            (intervalSelection[0] / 100) * processedTrack.duration;
          adjustedStartTicks = Math.round(
            note.ticks -
              (startTimeOffset + selectionStartInSeconds) *
                midiData.header.ppq *
                (60 / tempo),
          );
        } else {
          // Otherwise just adjust for silence trimming
          adjustedStartTicks = Math.round(
            note.ticks - startTimeOffset * midiData.header.ppq * (60 / tempo),
          );
        }

        return {
          noteNumber: note.midi,
          startTimeInTicks: Math.max(0, adjustedStartTicks), // Ensure no negative values
          durationInTicks: Math.round(note.durationTicks),
          velocity: Math.floor(note.velocity * 127),
          noteOffVelocity: 64,
        };
      });

      // Create the note sequence
      const noteSequence: PostNoteSequencesPayload = {
        name:
          file.name.replace(/\.[^/.]+$/, '') +
          ' - ' +
          (selectedTrack.name || `Track ${trackIndex + 1}`) +
          (intervalSelection ? ' (Selection)' : ' (Trimmed)'),
        tempo,
        timeSignature,
        ticksPerBeat: midiData.header.ppq,
        notes,
      };

      onConversionComplete(noteSequence);
    } catch (err) {
      const errorMessage = `Failed to convert MIDI file: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMessage);
      onError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsConverting(false);
    }
  };

  // Stop any currently playing preview
  const stopPlayback = () => {
    if (part.current) {
      part.current.stop();
      part.current.dispose();
      part.current = null;
    }
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setIsPlaying(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Handle seeking in the track
  const handleSeek = (value: number[]) => {
    const seekTime = (value[0] / 100) * trackDuration;
    setSeekPosition(value[0]);
    setCurrentTime(seekTime);

    if (isPlaying) {
      // If playing, update the transport time
      Tone.Transport.seconds = seekTime;
    } else {
      // If not playing, just update the visualization
      drawWaveform();
    }
  };

  // Play the selected track using Tone.js
  const togglePlayback = async () => {
    if (!midiData || selectedTrackIndex === '') return;

    // If already playing, stop playback
    if (isPlaying) {
      stopPlayback();
      return;
    }

    try {
      // Start audio context if it's not started yet
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // const trackIndex = parseInt(selectedTrackIndex);

      // Set the tempo from the MIDI file
      if (midiData.header.tempos.length > 0) {
        Tone.Transport.bpm.value = midiData.header.tempos[0].bpm;
      }

      // Reset transport time to current seek position
      Tone.Transport.seconds = currentTime;

      // Create a new part for the track using the processed (potentially trimmed) events
      const events = trackEvents.current.map((event) => ({
        time: event.time,
        note: Tone.Frequency(event.midi, 'midi').toNote(),
        duration: event.endTime - event.time,
        velocity: event.velocity,
      }));

      // Create a new part with the events
      part.current = new Tone.Part((time, event) => {
        if (synth.current) {
          synth.current.triggerAttackRelease(
            event.note,
            event.duration,
            time,
            event.velocity,
          );
        }
      }, events);

      // Start the part and the transport
      part.current.start(0);
      Tone.Transport.start();

      // Set up an event to stop playback when the track ends
      Tone.Transport.schedule(() => {
        stopPlayback();
        setCurrentTime(0);
        setSeekPosition(0);
      }, trackDuration);

      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play track preview:', err);
      stopPlayback();
    }
  };

  // Handle mouse down on canvas for selection
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isPlaying) return; // Don't allow selection while playing

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    setIsDragging(true);
    setDragStartX(x);

    // Add event listeners for mouse move and up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse move for selection
  const handleMouseMove = () => {
    if (!isDragging || !canvasRef.current) return;

    // const canvas = canvasRef.current;
    // const rect = canvas.getBoundingClientRect();
    // const x = e.clientX - rect.left;

    // Update the current drag position
    // const currentX = Math.min(Math.max(0, x), rect.width);

    // Redraw the waveform with the current selection
    drawWaveform();
  };

  // Handle mouse up to finalize selection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseUp = (e: MouseEvent | any) => {
    if (!isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Calculate the selection percentages
    const startPercent = (Math.min(dragStartX, x) / rect.width) * 100;
    const endPercent = (Math.max(dragStartX, x) / rect.width) * 100;

    // Only set selection if it's a meaningful size (more than 1% of the width)
    if (endPercent - startPercent > 1) {
      setIntervalSelection([startPercent, endPercent]);
    }

    setIsDragging(false);

    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Clear the selection
  const clearSelection = () => {
    setIntervalSelection(null);
    stopPlayback();
  };

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="rounded-md bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
        <p>No tracks with notes found in this MIDI file.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">MIDI File Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium">File Name:</p>
              <p className="text-muted-foreground">{file.name}</p>
            </div>
            <div>
              <p className="font-medium">Tempo:</p>
              <p className="text-muted-foreground">
                {midiData?.header.tempos.length
                  ? `${Math.round(midiData.header.tempos[0].bpm)} BPM`
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="font-medium">Time Signature:</p>
              <p className="text-muted-foreground">
                {midiData?.header.timeSignatures.length
                  ? `${midiData.header.timeSignatures[0].timeSignature[0]}/${midiData.header.timeSignatures[0].timeSignature[1]}`
                  : '4/4'}
              </p>
            </div>
            <div>
              <p className="font-medium">Tracks:</p>
              <p className="text-muted-foreground">
                {tracks.length} tracks with notes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex flex-col space-y-1.5">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="track-select"
          >
            Select Track
          </label>
          <div className="flex gap-2">
            <Select
              value={selectedTrackIndex}
              onValueChange={handleTrackChange}
            >
              <SelectTrigger className="flex-1" id="track-select">
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.index} value={track.index.toString()}>
                    {track.name} ({track.instrument}, {track.noteCount} notes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedTrackIndex}
              variant="outline"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="mr-2 size-4" />
                  Stop
                </>
              ) : (
                <>
                  <PlayIcon className="mr-2 size-4" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </div>

        {silenceTrimmed.start > 0 && (
          <div className="text-xs text-muted-foreground">
            Trimmed {formatTime(silenceTrimmed.start)} from start and{' '}
            {formatTime(silenceTrimmed.end)} from end.
            {originalTrackDuration > 0 && (
              <span>
                {' '}
                Reduced duration by{' '}
                {Math.round((1 - trackDuration / originalTrackDuration) * 100)}
                %.
              </span>
            )}
          </div>
        )}

        {selectedTrackIndex !== '' && (
          <div className="space-y-2 rounded-md border p-3">
            <div className="relative h-24 w-full">
              <canvas
                ref={canvasRef}
                className={`size-full ${isPlaying ? 'cursor-default' : 'cursor-crosshair'}`}
                onMouseDown={handleMouseDown}
              />
              {!isPlaying && (
                <div className="absolute bottom-1 left-1 text-xs text-muted-foreground">
                  {intervalSelection
                    ? 'Drag to adjust selection'
                    : 'Click and drag to select a portion'}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span> /{' '}
                <span>{formatTime(trackDuration)}</span>
              </div>
              {intervalSelection && (
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">
                    Selection:{' '}
                    {formatTime((intervalSelection[0] / 100) * trackDuration)} -{' '}
                    {formatTime((intervalSelection[1] / 100) * trackDuration)}
                    <span className="ml-2">
                      (
                      {formatTime(
                        ((intervalSelection[1] - intervalSelection[0]) / 100) *
                          trackDuration,
                      )}
                      )
                    </span>
                  </div>
                  <Button
                    className="h-6 px-2"
                    size="sm"
                    variant="outline"
                    onClick={clearSelection}
                  >
                    <XIcon className="mr-1 size-3" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
            <Slider
              disabled={isPlaying}
              max={100}
              min={0}
              step={0.1}
              value={[seekPosition]}
              onValueChange={handleSeek}
            />
          </div>
        )}

        <Button
          className="w-full"
          disabled={isConverting || !selectedTrackIndex}
          onClick={handleConvert}
        >
          {isConverting
            ? 'Converting...'
            : 'Convert Selected Track to Note Sequence'}
        </Button>
      </div>
    </div>
  );
};
