import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminRoutes } from '@/constants/routes';
import { PostNoteSequencesPayload } from '@/contexts/MusicAtlasContext/musicAtlas.generated';
import { useCreateNoteSequence } from '@/hooks/data';
import { MidiToNoteSequenceConverter } from './MidiToNoteSequenceConverter';

interface CreateNoteSequenceModalProps {
  children?: React.ReactNode;
}

export const CreateNoteSequenceModal = ({
  children,
}: CreateNoteSequenceModalProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'midi'>('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const navigate = useNavigate();

  const createNoteSequence = useCreateNoteSequence();

  const form = useForm<PostNoteSequencesPayload>({
    defaultValues: {
      name: '',
      tempo: 120,
      timeSignature: '4/4',
      ticksPerBeat: 480,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleManualCreate = async (data: PostNoteSequencesPayload) => {
    try {
      const result = await createNoteSequence.mutateAsync(data);
      toast.success('Note sequence created successfully');
      setOpen(false);
      navigate(AdminRoutes.noteSequence({ id: result.id }));
    } catch (error) {
      toast.error('Failed to create note sequence');
      console.error(error);
    }
  };

  const handleMidiConversionComplete = async (
    noteSequence: PostNoteSequencesPayload,
  ) => {
    try {
      const result = await createNoteSequence.mutateAsync(noteSequence);
      toast.success('Note sequence created from MIDI file');
      setOpen(false);
      navigate(AdminRoutes.noteSequence({ id: result.id }));
    } catch (error) {
      toast.error('Failed to create note sequence from MIDI file');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children || <Button>Create Note Sequence</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Note Sequence</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="manual"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'manual' | 'midi')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Create Manually</TabsTrigger>
            <TabsTrigger value="midi">From MIDI File</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Form {...form}>
              <form
                className="space-y-4 pt-4"
                onSubmit={form.handleSubmit(handleManualCreate)}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Note Sequence" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tempo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo (BPM)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeSignature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Signature</FormLabel>
                      <FormControl>
                        <Input placeholder="4/4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button disabled={createNoteSequence.isPending} type="submit">
                    {createNoteSequence.isPending
                      ? 'Creating...'
                      : 'Create & Edit'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent className="space-y-4 pt-4" value="midi">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Upload MIDI File
                </label>
                <Input
                  accept=".mid,.midi"
                  className="mt-1.5"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>

              {selectedFile && (
                <div className="pt-4">
                  <MidiToNoteSequenceConverter
                    file={selectedFile}
                    onConversionComplete={handleMidiConversionComplete}
                    onError={(error) => toast.error(error.message)}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
