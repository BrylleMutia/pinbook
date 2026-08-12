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

const MAX_EMOJI_CODE_POINTS = 8;

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const isPreset = EMOJIS.includes(value);

  const handleCustomInput = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    onChange([...trimmed].slice(0, MAX_EMOJI_CODE_POINTS).join(""));
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-stone-600">Icon</span>
      <input
        type="text"
        value={value}
        onChange={(e) => handleCustomInput(e.target.value)}
        placeholder="Type or paste your own…"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Custom icon"
        className={`w-full rounded-2xl border bg-stone-50 px-4 py-2.5 text-base outline-none transition focus:bg-white focus:ring-4 focus:ring-rose-100 ${
          isPreset ? "border-stone-200" : "border-rose-300 ring-2 ring-rose-200"
        }`}
      />
      {!isPreset && (
        <p className="mt-1 text-xs font-medium text-rose-500">
          Custom icon set — up to {MAX_EMOJI_CODE_POINTS} characters
        </p>
      )}
      <p className="mb-1.5 mt-3 text-xs text-stone-400">Or pick one:</p>
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
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
