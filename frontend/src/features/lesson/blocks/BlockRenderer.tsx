import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {
  CalloutBlockData,
  CodeBlockData,
  LessonBlock,
  TextBlockData,
  VideoBlockData,
} from '../lessonTypes';
import { CheckpointBlock } from './CheckpointBlock';
import { VisualBlock } from './VisualBlock';

// Content is rendered as React elements through react-markdown with no raw-HTML plugin,
// so markup in a block can never become live HTML.

const TextBlock: React.FC<{ block: TextBlockData }> = ({ block }) => (
  <div className="ls-prose">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {block.markdown}
    </ReactMarkdown>
  </div>
);

const isFileVideo = (url: string) => /\.(mp4|webm)(\?|$)/i.test(url);

const VideoBlock: React.FC<{ block: VideoBlockData }> = ({ block }) => (
  <section className="ls-video-wrap" aria-label={block.title}>
    <div className="ls-video">
      {isFileVideo(block.url) ? (
        <video controls preload="metadata" src={block.url} title={block.title}>
          {block.captions_url && <track kind="captions" src={block.captions_url} default />}
        </video>
      ) : (
        <iframe
          src={block.url}
          title={block.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allowFullScreen
        />
      )}
    </div>
    <div className="ls-video-meta">
      <span className="ls-muted">{block.title}</span>
      {block.transcript_url && (
        <a href={block.transcript_url} target="_blank" rel="noopener noreferrer" className="ls-link">
          Show transcript
        </a>
      )}
    </div>
  </section>
);

const CodeBlock: React.FC<{ block: CodeBlockData }> = ({ block }) => (
  <figure className="ls-code">
    <div className="ls-code-lang">{block.language}</div>
    <pre tabIndex={0}>
      <code>{block.code}</code>
    </pre>
    {block.caption && <figcaption className="ls-fineprint">{block.caption}</figcaption>}
  </figure>
);

const CalloutBlock: React.FC<{ block: CalloutBlockData }> = ({ block }) => (
  <aside className={`ls-callout ls-callout--${block.variant}`}>
    {block.title && <strong className="ls-callout-title">{block.title}</strong>}
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text}</ReactMarkdown>
  </aside>
);

interface BlockRendererProps {
  block: LessonBlock;
  sectionId: number;
  /** Admin draft preview: checkpoints are not graded (the section may not be published). */
  preview?: boolean;
  onCheckpointPassed?: (sectionCompleted: boolean) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, sectionId, preview = false, onCheckpointPassed }) => {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'video':
      return <VideoBlock block={block} />;
    case 'visual':
      return <VisualBlock block={block} preview={preview} />;
    case 'code':
      return <CodeBlock block={block} />;
    case 'callout':
      return <CalloutBlock block={block} />;
    case 'checkpoint':
      return <CheckpointBlock block={block} sectionId={sectionId} preview={preview} onPassed={onCheckpointPassed} />;
    default:
      return null; // unknown block types from a newer backend are skipped, not crashed on
  }
};
