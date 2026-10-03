import type { AdminBlock, BlockType } from './adminTypes';

export const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'video', label: 'Video' },
  { type: 'visual', label: 'Visual' },
  { type: 'code', label: 'Code' },
  { type: 'callout', label: 'Callout' },
  { type: 'checkpoint', label: 'Checkpoint' },
];

export const MAX_BLOCKS = 50;
export const MAX_OPTIONS = 6;

export function newBlockId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function newBlock(type: BlockType): AdminBlock {
  const id = newBlockId();
  switch (type) {
    case 'text':
      return { type, id, markdown: '' };
    case 'video':
      return { type, id, url: '', title: '', captions_url: '', transcript_url: '' };
    case 'visual':
      return { type, id, kind: '', title: '', description: '', simulation: false };
    case 'code':
      return { type, id, language: 'text', code: '', caption: '' };
    case 'callout':
      return { type, id, variant: 'info', title: '', text: '' };
    case 'checkpoint':
      return { type, id, question: '', options: ['', ''], correct_index: 0, explanation: '' };
  }
}

/** Empty optional strings are sent as null so the backend treats them as unset. */
export function toPayload(blocks: AdminBlock[]): AdminBlock[] {
  return blocks.map((b) => {
    const copy: Record<string, unknown> = { ...b };
    for (const key of ['title', 'caption', 'captions_url', 'transcript_url', 'explanation'] as const) {
      if (key in copy && typeof copy[key] === 'string' && (copy[key] as string).trim() === '') copy[key] = null;
    }
    if (copy.type === 'video' && (copy.duration_seconds === '' || copy.duration_seconds === undefined)) {
      delete copy.duration_seconds;
    }
    return copy as unknown as AdminBlock;
  });
}

/** Quick client-side check of required fields, so the author gets a friendly message
 *  before the request. The server remains the authority and re-validates everything. */
export function requiredFieldProblems(blocks: AdminBlock[]): string[] {
  const problems: string[] = [];
  blocks.forEach((b, i) => {
    const where = `Block ${i + 1} (${b.type})`;
    const blank = (v: string | null | undefined) => !v || v.trim() === '';
    switch (b.type) {
      case 'text':
        if (blank(b.markdown)) problems.push(`${where}: text is empty`);
        break;
      case 'video':
        if (blank(b.url)) problems.push(`${where}: video URL is required`);
        if (blank(b.title)) problems.push(`${where}: title is required`);
        break;
      case 'visual':
        if (blank(b.kind)) problems.push(`${where}: component kind is required`);
        if (blank(b.description)) problems.push(`${where}: description is required`);
        break;
      case 'code':
        if (blank(b.code)) problems.push(`${where}: code is empty`);
        break;
      case 'callout':
        if (blank(b.text)) problems.push(`${where}: text is empty`);
        break;
      case 'checkpoint':
        if (blank(b.question)) problems.push(`${where}: question is required`);
        if (b.options.some((o) => blank(o))) problems.push(`${where}: every option needs text`);
        break;
    }
  });
  return problems;
}
