import { useState, type FormEvent } from "react";
import type { PageInput } from "../types";
import { EmojiPicker } from "./EmojiPicker";

interface PageFormProps {
  initial?: { title: string; iconEmoji: string } | null;
  submitting: boolean;
  onSubmit: (data: PageInput) => Promise<void>;
}

export function PageForm({ initial, submitting, onSubmit }: PageFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [iconEmoji, setIconEmoji] = useState(initial?.iconEmoji ?? "📄");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    await onSubmit({ title: title.trim(), iconEmoji });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="page-title" className="mb-1.5 block text-sm font-medium text-stone-600">
          Title
        </label>
        <input
          id="page-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="e.g. AWS"
          autoFocus
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
      </div>
      <EmojiPicker value={iconEmoji} onChange={setIconEmoji} />
      <button
        type="submit"
        disabled={!title.trim() || submitting}
        className="w-full rounded-full bg-rose-400 py-3 font-semibold text-white shadow-lg shadow-rose-200 transition active:scale-[0.98] disabled:opacity-40"
      >
        {submitting ? "Saving…" : initial ? "Save changes" : "Create page"}
      </button>
    </form>
  );
}
