import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { GetNoteSequencesByIdData } from '@/contexts/MusicAtlasContext/musicAtlas.generated';

export interface PlayingState {
  isPlaying: boolean;
  activeNotes: number[];
  totalDuration: number; // in seconds
  currentPosition: number; // in seconds
  progress: number; // 0 to 1
}

export function useNoteSequencePlayer(noteSequence?: GetNoteSequencesByIdData) {
  const [playingState, setPlayingState] = useState<PlayingState>({
    isPlaying: false,
    activeNotes: [],
    totalDuration: 0,
    currentPosition: 0,
    progress: 0,
  });

  // Refs for Tone.js objects
  const synth = useRef<Tone.PolySynth | null>(null);
  const part = useRef<Tone.Part | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  // Convert ticks to seconds based on tempo and time signature
  const ticksToSeconds = useCallback(
    (ticks: number, tempo: number, ticksPerBeat: number) => {
      const beatsPerSecond = tempo / 60;
      const secondsPerBeat = 1 / beatsPerSecond;
      const secondsPerTick = secondsPerBeat / ticksPerBeat;
      return ticks * secondsPerTick;
    },
    [],
  );

  // Stop playback - defined early to avoid dependency cycle
  const stopPlayback = useCallback(() => {
    if (part.current) {
      part.current.stop();
      part.current.dispose();
      part.current = null;
    }

    Tone.Transport.stop();
    Tone.Transport.cancel();

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    startTime.current = null;
    isPlayingRef.current = false;

    setPlayingState((prev) => ({
      ...prev,
      isPlaying: false,
      activeNotes: [],
      currentPosition: 0,
      progress: 0,
    }));
  }, []);

  // Update playback position
  const updatePlaybackPosition = useCallback(() => {
    if (!startTime.current || !noteSequence || !isPlayingRef.current) {
      return;
    }

    const currentTime = Tone.now();
    const elapsedTime = currentTime - startTime.current;

    // Calculate progress (0 to 1)
    const progress = Math.min(elapsedTime / playingState.totalDuration, 1);

    setPlayingState((prev) => ({
      ...prev,
      currentPosition: elapsedTime,
      progress: progress,
    }));

    // Continue updating if still playing
    if (progress < 1 && isPlayingRef.current) {
      animationFrameId.current = requestAnimationFrame(updatePlaybackPosition);
    } else if (progress >= 1) {
      stopPlayback();
    }
  }, [noteSequence, playingState.totalDuration, stopPlayback]);

  // Start playback
  const startPlayback = useCallback(async () => {
    if (!synth.current || !noteSequence) return;

    try {
      // Start audio context if it's not started yet
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // Stop any existing playback
      stopPlayback();

      // Reset active notes and position
      setPlayingState((prev) => ({
        ...prev,
        isPlaying: true,
        activeNotes: [],
        currentPosition: 0,
        progress: 0,
      }));

      isPlayingRef.current = true;

      // Create events from notes
      const events = noteSequence.Notes.map((note) => ({
        time: ticksToSeconds(
          note.startTimeInTicks,
          noteSequence.tempo,
          noteSequence.ticksPerBeat,
        ),
        note: Tone.Frequency(note.noteNumber, 'midi').toNote(),
        duration: ticksToSeconds(
          note.durationInTicks,
          noteSequence.tempo,
          noteSequence.ticksPerBeat,
        ),
        velocity: note.velocity / 127,
        noteNumber: note.noteNumber,
      }));

      // Create a new part with the events
      part.current = new Tone.Part((time, event) => {
        if (synth.current) {
          // Add to active notes
          setPlayingState((prev) => ({
            ...prev,
            activeNotes: [...prev.activeNotes, event.noteNumber],
          }));

          // Play the note
          synth.current.triggerAttackRelease(
            event.note,
            event.duration,
            time,
            event.velocity,
          );

          setTimeout(
            () => {
              setPlayingState((prev) => ({
                ...prev,
                activeNotes: prev.activeNotes.filter(
                  (n) => n !== event.noteNumber,
                ),
              }));
            },
            time + event.duration * 1000,
          );
        }
      }, events);

      // Start the part and the transport
      part.current.start(0);
      Tone.Transport.start();
      startTime.current = Tone.now();

      // Start animation frame for tracking progress
      updatePlaybackPosition();

      // Set up an event to stop playback at the end
      const maxTick = noteSequence.Notes.reduce(
        (max, note) =>
          Math.max(max, note.startTimeInTicks + note.durationInTicks),
        0,
      );

      const totalDuration = ticksToSeconds(
        maxTick,
        noteSequence.tempo,
        noteSequence.ticksPerBeat,
      );

      Tone.Transport.schedule(() => {
        if (isPlayingRef.current) {
          stopPlayback();
        }
      }, totalDuration);
    } catch (err) {
      console.error('Failed to start playback:', err);
      stopPlayback();
    }
  }, [noteSequence, ticksToSeconds, stopPlayback, updatePlaybackPosition]);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    if (playingState.isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [playingState.isPlaying, startPlayback, stopPlayback]);

  // Calculate total duration of the note sequence
  useEffect(() => {
    if (!noteSequence) return;

    const maxTick = noteSequence.Notes.reduce(
      (max, note) =>
        Math.max(max, note.startTimeInTicks + note.durationInTicks),
      0,
    );

    const totalDurationInSeconds = ticksToSeconds(
      maxTick,
      noteSequence.tempo,
      noteSequence.ticksPerBeat,
    );

    setPlayingState((prev) => ({
      ...prev,
      totalDuration: totalDurationInSeconds,
    }));
  }, [noteSequence, ticksToSeconds]);

  // Initialize synth for playback
  useEffect(() => {
    // Create a polyphonic synth for playing multiple notes simultaneously
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();

    // Set up Tone.js transport
    if (noteSequence) {
      Tone.Transport.bpm.value = noteSequence.tempo;
    }

    // Clean up when component unmounts
    return () => {
      stopPlayback();
      if (synth.current) {
        synth.current.dispose();
      }
    };
  }, [noteSequence, stopPlayback]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  return [togglePlayback, playingState] as const;
}
