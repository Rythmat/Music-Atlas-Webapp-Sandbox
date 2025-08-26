import { useMemo } from 'react';
import { ImageComponent } from '@/components/ImageComponent';
import { PhraseMapRenderer } from '../../phraseMaps/components/PhraseMapRenderer';
import { PlayAlongPlayer } from '../../playAlongs/components/PlayAlongPlayer';
import { NoteSequenceRenderer } from './NoteSequenceRenderer';
import { YouTubePlayer } from './YouTubePlayer';

export const useMarkdownComponents = (parentColor?: string) => {
  return useMemo(
    () => ({
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1 className="mb-1 text-4xl font-medium text-foreground">
          {children}
        </h1>
      ),
      // Intercept <em> tags that match our custom syntax
      // eslint-disable-next-line sonarjs/cognitive-complexity
      em: ({ children }: { children?: React.ReactNode }) => {
        if (typeof children !== 'string') return <i>{children}</i>;

        // Match our custom syntax for note sequences: _component:sequence(097d5c5e-62e1-418b-9f3d-a32aa9015294,piano,preview,#ff0000)_
        // The third parameter (view mode) is optional, fourth parameter (color) is optional
        const sequenceMatch = children.match(
          /component:sequence\(([^,]+),\s*([^,)]+)(?:,\s*([^,)]+))?(?:,\s*([^)]+))?\)/,
        );

        if (sequenceMatch) {
          const sequenceId = sequenceMatch[1];
          const viewType = sequenceMatch[2]; // 'piano' or potentially other view types
          const viewMode = sequenceMatch[3] || 'play_along'; // Default to 'play_along' if not specified
          const color = sequenceMatch[4] || parentColor || undefined;
          return (
            <NoteSequenceRenderer
              color={color}
              id={sequenceId}
              viewMode={viewMode}
              viewType={viewType}
            />
          );
        }

        // Match our custom syntax for rhythm maps: _component:rhythmmap(097d5c5e-62e1-418b-9f3d-a32aa9015294,default,#ff0000)_
        // The second parameter (view mode) is optional, third parameter (color) is optional
        const phraseMapMatch = children.match(
          /component:rhythmmap\(([^,]+)(?:,\s*([^,)]+))?(?:,\s*([^)]+))?\)/,
        );

        if (phraseMapMatch) {
          const phraseMapId = phraseMapMatch[1];
          const viewMode = phraseMapMatch[2] || 'default'; // Default to 'default' if not specified
          const color = phraseMapMatch[3] || parentColor || undefined;
          return (
            <PhraseMapRenderer
              color={color}
              id={phraseMapId}
              viewMode={viewMode}
            />
          );
        }

        // Match our custom syntax for play alongs: _component:playalong(097d5c5e-62e1-418b-9f3d-a32aa9015294,compact,#ff0000)_
        // The second parameter (compact mode) is optional, third parameter (color) is optional
        const playAlongMatch = children.match(
          /component:playalong\(([^,]+)(?:,\s*([^,)]+))?(?:,\s*([^)]+))?\)/,
        );

        if (playAlongMatch) {
          const playAlongId = playAlongMatch[1];
          const secondParam = playAlongMatch[2];

          let color: string | undefined = parentColor || undefined;

          if (secondParam) {
            color = playAlongMatch[3] || parentColor || undefined;
          }

          return <PlayAlongPlayer color={color} id={playAlongId} />;
        }

        // Match our custom syntax for YouTube videos: _component:youtube(dQw4w9WgXcQ, 640, 480, minimal)_
        // Parameters after the video ID are:
        // - width (optional)
        // - height (optional)
        // - mode: "minimal" to hide controls and branding (optional)
        const youtubeMatch = children.match(
          /component:youtube\(([^,]+)(?:,\s*(\d+))?(?:,\s*(\d+))?(?:,\s*([^)]+))?\)/,
        );

        if (youtubeMatch) {
          const videoId = youtubeMatch[1];
          const width = youtubeMatch[2]
            ? parseInt(youtubeMatch[2], 10)
            : undefined;
          const height = youtubeMatch[3]
            ? parseInt(youtubeMatch[3], 10)
            : undefined;
          const mode = youtubeMatch[4]?.trim();

          // Check if minimal mode is requested
          const showControls = mode !== 'minimal' && mode !== 'nocontrols';
          const minimalUI = mode === 'minimal';

          return (
            <YouTubePlayer
              height={height}
              minimalUI={minimalUI}
              showControls={showControls}
              videoId={videoId}
              width={width}
            />
          );
        }

        // Match our custom syntax for images: _component:image(url, altText, width)_
        // The altText and width parameters are optional
        const imageMatch = children.match(
          /component:image\(([^,]+)(?:,\s*([^,)]+))?(?:,\s*([^)]+))?\)/,
        );

        if (imageMatch) {
          const url = imageMatch[1];
          const altText = imageMatch[2] || ''; // Default to empty string if not provided
          const width = imageMatch[3] || undefined; // Width percentage, optional
          return <ImageComponent altText={altText} url={url} width={width} />;
        }

        // If none of the custom syntaxes match, render as default italic text
        return <i>{children}</i>;
      },
    }),
    [parentColor],
  );
};
