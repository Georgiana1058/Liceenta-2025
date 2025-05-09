// src/components/dashboard/resume/preview/PortofolioPreview.jsx
import React from "react";

export default function PortofolioPreview({ resumeInfo = {} }) {
  const projects = Array.isArray(resumeInfo.portofolio)
    ? resumeInfo.portofolio
    : [];

  if (projects.length === 0) return null;

  return (
    <div className="mt-6">
      {/** Section title, centered */}
      <h2
        className="text-center font-bold text-sm mb-2"
        style={{ color: resumeInfo.themeColor }}
      >
        Portfolio
      </h2>
      <hr style={{ borderColor: resumeInfo.themeColor }} />

      {/** List of projects */}
      <div className="space-y-6 mt-4">
        {projects.map((p, i) => (
          <div key={i} className="space-y-1">
            <h3
              className="font-bold text-sm"
              style={{ color: resumeInfo.themeColor }}
            >
              {p.projectTitle}
            </h3>
            <p className="text-sm">{p.description}</p>
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View Project
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
