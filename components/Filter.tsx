import React from "react";

interface FilterProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function Filter({
  value,
  onChange,
  placeholder = "Search by room, PIC name, or status...",
}: FilterProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {value && (
        <button
          onClick={() => onChange({ target: { value: "" } } as any)}
          className="px-3 py-2 text-gray-500 hover:text-gray-700"
          title="Clear filter"
        >
          ✕
        </button>
      )}
    </div>
  );
}
