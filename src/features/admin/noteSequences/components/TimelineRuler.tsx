import { useRef, useEffect } from 'react';

interface TimelineRulerProps {
  ticksPerBeat: number;
  timeSignature: string;
  zoomLevel: number;
  currentTick: number;
}

export const TimelineRuler = ({
  ticksPerBeat,
  timeSignature,
  zoomLevel,
  currentTick,
}: TimelineRulerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parse time signature
  const [beatsPerBar, beatUnit] = timeSignature.split('/').map(Number);

  // Calculate pixels per tick based on zoom level
  const pixelsPerTick = 0.1 * zoomLevel;

  // Draw the ruler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate total visible ticks
    const visibleWidth = canvas.offsetWidth;
    const totalVisibleTicks = Math.ceil(visibleWidth / pixelsPerTick);

    // Draw background
    ctx.fillStyle = 'rgb(241, 245, 249)'; // bg-slate-100
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw beat lines
    const ticksPerBar = ticksPerBeat * beatsPerBar;

    for (let tick = 0; tick <= totalVisibleTicks; tick++) {
      const x = tick * pixelsPerTick;

      // Bar line (strong)
      if (tick % ticksPerBar === 0) {
        const barNumber = Math.floor(tick / ticksPerBar) + 1;

        ctx.strokeStyle = 'rgb(51, 65, 85)'; // text-slate-700
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.offsetHeight);
        ctx.stroke();

        // Draw bar number
        ctx.fillStyle = 'rgb(51, 65, 85)'; // text-slate-700
        ctx.font = '10px sans-serif';
        ctx.fillText(`${barNumber}`, x + 2, 10);
      }
      // Beat line (medium)
      else if (tick % ticksPerBeat === 0) {
        ctx.strokeStyle = 'rgb(148, 163, 184)'; // text-slate-400
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.offsetHeight * 0.7);
        ctx.stroke();

        // Draw beat number within bar
        const beatInBar = Math.floor((tick % ticksPerBar) / ticksPerBeat) + 1;
        if (beatInBar <= beatsPerBar) {
          ctx.fillStyle = 'rgb(100, 116, 139)'; // text-slate-500
          ctx.font = '8px sans-serif';
          ctx.fillText(`${beatInBar}`, x + 2, 18);
        }
      }
      // Subdivision line (weak)
      else if (tick % (ticksPerBeat / 4) === 0) {
        ctx.strokeStyle = 'rgb(203, 213, 225)'; // text-slate-300
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.offsetHeight * 0.4);
        ctx.stroke();
      }
    }

    // Draw playhead
    const playheadX = currentTick * pixelsPerTick;
    ctx.strokeStyle = 'rgb(239, 68, 68)'; // text-red-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, canvas.offsetHeight);
    ctx.stroke();
  }, [
    ticksPerBeat,
    beatsPerBar,
    beatUnit,
    zoomLevel,
    currentTick,
    pixelsPerTick,
  ]);

  return (
    <div className="relative h-8 border-b bg-slate-100 dark:bg-slate-800">
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};
