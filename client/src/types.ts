export interface Page {
  id: string;
  title: string;
  iconEmoji: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  entryCount: number;
}

export interface Entry {
  id: string;
  pageId: string;
  title: string;
  description: string;
  url: string;
  iconEmoji: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageDetail {
  id: string;
  title: string;
  iconEmoji: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  entries: Entry[];
}

export interface PageInput {
  title: string;
  iconEmoji: string;
}

export interface EntryInput {
  pageId: string;
  title: string;
  description: string;
  url: string;
  iconEmoji: string;
}
