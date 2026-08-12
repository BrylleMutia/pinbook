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

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-stone-600">Icon</span>
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
