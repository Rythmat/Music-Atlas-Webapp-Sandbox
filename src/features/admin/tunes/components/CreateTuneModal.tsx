import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminRoutes } from '@/constants/routes';
import { useCreateTune } from '@/hooks/data';

export const CreateTuneModal = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('Untitled tune');
  const [color, setColor] = useState<string | null>(null);
  const [tempo, setTempo] = useState(120);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [beatUnit, setBeatUnit] = useState(4);

  const createTune = useCreateTune();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createTune.mutateAsync({
        title,
        color,
        tempo,
        beatsPerMeasure,
        beatUnit,
      });

      // Redirect to the newly created tune's edit page
      navigate(AdminRoutes.tune({ id: result.id }));
    } catch (error) {
      console.error('Failed to create tune:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold">Create New Tune</h2>
        <p className="text-sm text-gray-500">
          Enter the basic information for your new tune
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tempo">Tempo (BPM)</Label>
          <Input
            id="tempo"
            max={300}
            min={1}
            step={1}
            type="number"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="beatsPerMeasure">Beats Per Measure</Label>
            <Input
              id="beatsPerMeasure"
              max={16}
              min={1}
              step={1}
              type="number"
              value={beatsPerMeasure}
              onChange={(e) => setBeatsPerMeasure(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beatUnit">Beat Unit</Label>
            <Input
              id="beatUnit"
              max={16}
              min={1}
              step={1}
              type="number"
              value={beatUnit}
              onChange={(e) => setBeatUnit(Number(e.target.value))}
            />
          </div>
        </div>

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating...' : 'Create Tune'}
        </Button>
      </form>
    </div>
  );
};
