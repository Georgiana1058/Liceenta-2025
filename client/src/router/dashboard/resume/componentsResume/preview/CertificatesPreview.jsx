// src/components/dashboard/resume/preview/CertificatesPreview.jsx
import React from "react";
import { FileText } from "lucide-react";

export default function CertificatesPreview({ resumeInfo = {} }) {
  const root = resumeInfo.certificateUrl || null;
  const certs = Array.isArray(resumeInfo.certificates)
    ? resumeInfo.certificates
    : [];

  if ((!root || !root.url) && certs.length === 0) return null;

  return (
    <div className="mt-6">
      {/* Titlul secțiunii, centrat și cu tema */}
      <h2
        className="text-center font-bold text-sm mb-2"
        style={{ color: resumeInfo.themeColor }}
      >
        Certificates
      </h2>
      <hr style={{ borderColor: resumeInfo.themeColor }} />

      {/*––– Global PDF –––*/}
      {root?.url && (
        <div className="my-4 flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
          <a
            href={`http://localhost:1337${root.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-sm font-medium text-blue-600 hover:underline"
            style={{ letterSpacing: "0.5px" }}
          >
            {root.name}
          </a>
        </div>
      )}

      {/*––– Lista individuală –––*/}
      <div className="space-y-6">
        {certs.map((c, i) => (
          <div key={i} className="space-y-1">
            <h2 className="font-bold text-sm" style={{ color: resumeInfo.themeColor }}>{c.title}</h2>



            <p className="text-sm">{c.issuer}</p>
            <p className="text-xs text-gray-600">
              {c.issuerDate
                ? new Date(c.issuerDate).toLocaleDateString()
                : ""}
            </p>

            <div className="flex items-center gap-4 mt-1">
              {/* Link extern la credentialUrl */}
              {c.credentialUrl && (
                <a
                  href={c.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Credential
                </a>
              )}

              {/* Atașament media per certificat */}
              {c.certificateUrl?.url && (
                /\.(jpe?g|png|gif)$/i.test(c.certificateUrl.name) ? (
                  <img
                    src={`http://localhost:1337${c.certificateUrl.url}`}
                    alt={c.certificateUrl.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ) : (
                  <a
                    href={`http://localhost:1337${c.certificateUrl.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" /> {c.certificateUrl.name}
                  </a>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
