import { useState } from "react";

export default function SingleSelectCombobox({ options = [], selectedValue, onChange }) {
  const [search, setSearch] = useState("");
  const selectedOption = options.find(opt => opt.value?.toString() === selectedValue?.toString());

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-4">
      {selectedOption ? (
        <div className="flex items-center justify-between bg-blue-100 px-3 py-2 rounded text-sm mb-2">
          <span>✅ Selected: <strong>{selectedOption.label}</strong></span>
          <button
            className="text-red-600 font-bold ml-2"
            onClick={() => onChange(null)}
          >
            ×
          </button>
        </div>
      ) : (
        <>
          <input
            placeholder="Search CV..."
            className="border p-2 rounded w-full mb-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="border p-2 rounded max-h-40 overflow-y-auto">
            {filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setSearch("");
                }}
                className="cursor-pointer p-1 rounded hover:bg-blue-50"
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
