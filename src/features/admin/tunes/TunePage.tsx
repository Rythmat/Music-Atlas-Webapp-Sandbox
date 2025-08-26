import { useParams } from 'react-router-dom';
import { TuneEditor } from './components/TuneEditor';

export const TunePage = () => {
  const { id = '' } = useParams<{ id: string }>();

  return <TuneEditor tuneId={id} />;
};
