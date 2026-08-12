import { useState, type FormEvent } from "react";
import type { Entry } from "../types";
import { EmojiPicker } from "./EmojiPicker";
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from "./ui";

interface EntryFormProps {
  initial?: Entry | null;
  submitting: boolean;
  onSubmit: (data: {
    title: string;
    description: string;
    url: string;
    iconEmoji: string;
  }) => Promise<void>;
  onMove?: (direction: "up" | "down") => Promise<void>;
  onDelete?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export function EntryForm({
  initial,
  submitting,
  onSubmit,
  onMove,
  onDelete,
  canMoveUp,
  canMoveDown,
}: EntryFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [iconEmoji, setIconEmoji] = useState(initial?.iconEmoji ?? "🔗");
  const [urlError, setUrlError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!/^https?:\/\/.+/i.test(url.trim())) {
      setUrlError("Must be a valid http(s) link");
      return;
    }
    if (!title.trim()) return;
    setUrlError("");
    await onSubmit({ title: title.trim(), url: url.trim(), description: description.trim(), iconEmoji });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="entry-title" className="mb-1.5 block text-sm font-medium text-stone-600">
          Title
        </label>
        <input
          id="entry-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="e.g. AWS Documentation"
          autoFocus
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
      </div>
      <div>
        <label htmlFor="entry-url" className="mb-1.5 block text-sm font-medium text-stone-600">
          Link
        </label>
        <input
          id="entry-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          maxLength={2048}
          inputMode="url"
          autoCapitalize="none"
          placeholder="https://docs.aws.amazon.com"
          className={`w-full rounded-2xl border bg-stone-50 px-4 py-3 text-base outline-none transition focus:bg-white focus:ring-4 focus:ring-rose-100 ${
            urlError ? "border-rose-400" : "border-stone-200 focus:border-rose-300"
          }`}
        />
        {urlError && <p className="mt-1 text-xs font-medium text-rose-500">{urlError}</p>}
      </div>
      <div>
        <label htmlFor="entry-description" className="mb-1.5 block text-sm font-medium text-stone-600">
          Description <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          id="entry-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="What you'll find here"
          className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
      </div>
      <EmojiPicker value={iconEmoji} onChange={setIconEmoji} />
      {onMove && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onMove("up")}
            disabled={!canMoveUp}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-stone-200 py-2.5 text-sm font-medium text-stone-600 transition active:scale-95 disabled:opacity-30"
          >
            <ArrowUpIcon className="h-4 w-4" /> Move up
          </button>
          <button
            type="button"
            onClick={() => onMove("down")}
            disabled={!canMoveDown}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-stone-200 py-2.5 text-sm font-medium text-stone-600 transition active:scale-95 disabled:opacity-30"
          >
            <ArrowDownIcon className="h-4 w-4" /> Move down
          </button>
        </div>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-rose-50 py-2.5 text-sm font-semibold text-rose-500 transition active:scale-95"
        >
          <TrashIcon className="h-4 w-4" /> Delete entry
        </button>
      )}
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="w-full rounded-full bg-rose-400 py-3 font-semibold text-white shadow-lg shadow-rose-200 transition active:scale-[0.98] disabled:opacity-40"
      >
        {submitting ? "Saving…" : initial ? "Save changes" : "Add link"}
      </button>
    </form>
  );
}
