import { useState } from "react";

const EMOJIS = [
  "📘", "📕", "📗", "📙", "📖", "📚", "📝", "✏️",
  "💡", "🚀", "⚡", "🔥", "⭐", "🌟", "🎯", "🧩",
  "🛠️", "⚙️", "🔧", "🗺️", "🧭", "📎", "🔗", "🌐",
  "💻", "🖥️", "📱", "🧠", "🤖", "☕", "🐍", "⚛️",
  "🎨", "🖌️", "🎮", "🎲", "🎧", "🎬", "📷", "🔍",
  "🚦", "🏗️", "🧪", "✅", "⚠️", "💬", "📣", "📦",
  "🧊", "🔐", "🗄️", "📂", "🗂️", "☁️", "🌍", "🔮",
  "🎭", "👾", "🦀", "🧑‍💻",
];

const SINGLE_EMOJI_RE =
  /^(?:[\p{Extended_Pictographic}\p{Emoji_Presentation}]|[\p{Regional_Indicator}]{2}|[\d#*]\uFE0F\u20E3)\p{Emoji_Modifier}?(?:\u200D[\p{Extended_Pictographic}\p{Emoji_Presentation}]\p{Emoji_Modifier}?)*[\uFE0F\u20E3]*$/u;

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const isPreset = EMOJIS.includes(value);
  const [error, setError] = useState("");

  const select = (emoji: string) => {
    setError("");
    onChange(emoji);
  };

  const handleCustomInput = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setError("");
      onChange("");
      return;
    }
    if (SINGLE_EMOJI_RE.test(trimmed)) {
      setError("");
      onChange(trimmed);
    } else {
      setError("Only one emoji is allowed — text isn't supported");
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-stone-600">Icon</span>
      <input
        type="text"
        value={value}
        onChange={(e) => handleCustomInput(e.target.value)}
        onFocus={(e) => e.target.select()}
        placeholder="Type or paste an emoji…"
        maxLength={32}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Custom icon"
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-2xl border bg-stone-50 px-4 py-2.5 text-base outline-none transition focus:bg-white focus:ring-4 focus:ring-rose-100 ${
          error ? "border-rose-400 ring-2 ring-rose-200" : "border-stone-200"
        }`}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
      {!error && !isPreset && value !== "" && (
        <p className="mt-1 text-xs font-medium text-rose-500">Custom icon set</p>
      )}
      <p className="mb-1.5 mt-3 text-xs text-stone-400">Or pick one:</p>
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => select(emoji)}
            aria-pressed={value === emoji}
            className={`flex h-9 items-center justify-center rounded-lg text-xl transition ${
              value === emoji
                ? "bg-rose-200 ring-2 ring-rose-400"
                : "hover:bg-stone-100 active:bg-stone-200"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
