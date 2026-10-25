export type JournalOwner = 'alizhan' | 'dilnaz';

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'single-choice'
  | 'multi-choice'
  | 'drawing'
  | 'photo'
  | 'voice';

export type JournalSectionId =
  | 'chapter1'
  | 'chapter2'
  | 'chapter3'
  | 'chapter4'
  | 'chapter5'
  | 'chapter6'
  | 'chapter7'
  | 'media';

export interface QuestionOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface Question {
  id: string; // 'q1', 'q2', ... 'q67'
  number: number; // 1..67
  sectionId: JournalSectionId;
  title: string | { alizhan: string; dilnaz: string };
  subtitle?: string | { alizhan: string; dilnaz: string };
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  allowCustomInput?: boolean;
  allowAttachments?: boolean;
}

export interface AnswerAttachment {
  photoUrl?: string;
  drawingUrl?: string;
  voiceUrl?: string;
}

export interface Answer {
  id: string; // `${owner}_${questionId}`
  owner: JournalOwner;
  questionId: string;
  sectionId: JournalSectionId;
  value: string | string[];
  attachments?: AnswerAttachment;
  isShared?: boolean;
  updatedAt: number;
}

export interface JournalPhoto {
  id: string;
  owner: JournalOwner;
  dataUrl: string;
  caption?: string;
  category?: 'drawing' | 'photo';
  createdAt: number;
}

export interface TimeCapsuleSnapshot {
  id: string;
  owner: JournalOwner;
  title: string;
  note?: string;
  createdAt: number;
  targetOpenDate?: string;
  answers: Record<string, string | string[]>;
  attachments?: Record<string, AnswerAttachment>;
}

export interface JournalSectionInfo {
  id: JournalSectionId;
  title: string;
  number?: number;
  iconName: string;
  subtitle: string;
}

export interface BrotherAudioRecord {
  id: 'brother_audio';
  dataUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  updatedAt: number;
}
