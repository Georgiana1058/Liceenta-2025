// FeedbackStars.jsx
import React from "react";
import { Star } from "lucide-react";

export default function FeedbackStars({ value = 0, onChange, disabled = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            i <= value ? "text-yellow-500" : "text-gray-300"
          } ${disabled ? "cursor-default" : "hover:text-yellow-400"}`}
          onClick={() => !disabled && onChange?.(i)}
          fill={i <= value ? "#eab308" : "none"}
        />
      ))}
    </div>
  );
}
