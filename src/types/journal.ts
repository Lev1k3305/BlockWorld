export type JournalOwner = 'alizhan' | 'dilnaz';

export type QuestionType = 'text' | 'textarea' | 'single-choice' | 'multi-choice';

export type JournalSectionId =
  | 'about'
  | 'favorites'
  | 'dreams'
  | 'character'
  | 'memories'
  | 'media';

export interface QuestionOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface Question {
  id: string;
  sectionId: JournalSectionId;
  title: string;
  subtitle?: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  allowCustomInput?: boolean;
}

export interface Answer {
  id: string; // `${owner}_${questionId}`
  owner: JournalOwner;
  questionId: string;
  sectionId: JournalSectionId;
  value: string | string[];
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
  answers: Record<string, string | string[]>;
}

export interface JournalSectionInfo {
  id: JournalSectionId;
  title: string;
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
