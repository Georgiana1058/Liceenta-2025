import { useState } from "react";

export default function MultiSelectCombobox({ options = [], selectedValues = [], onChange }) {
  const [search, setSearch] = useState("");

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (val) => {
    const valStr = val.toString();
    const selectedStr = selectedValues.map(v => v.toString());
    if (selectedStr.includes(valStr)) {
      onChange(selectedValues.filter((v) => v.toString() !== valStr));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className="mb-4">
      <input
        placeholder="Search participants..."
        className="border p-2 rounded w-full mb-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="border p-2 rounded max-h-40 overflow-y-auto">
        {filtered.map((opt) => {
          const isChecked = selectedValues.map(v => v.toString()).includes(opt.value.toString());
          return (
            <div
              key={opt.value}
              className="flex items-center gap-2 p-1 cursor-pointer hover:bg-gray-100"
              onClick={() => toggle(opt.value)}
            >
              <input type="checkbox" readOnly checked={isChecked} />
              <span>{opt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
