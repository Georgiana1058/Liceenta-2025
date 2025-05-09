import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ResumeInfoContext } from "@/context/ResumeInfoContext";
import GlobalAPI from "../../../../../../service/GlobalAPI";
import { Plus, Trash2, Upload, LoaderCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getMediaId } from "@/lib/mediaUtils";

const emptyCertificate = {
  title: "",
  issuer: "",
  issuerDate: "",
  credentialUrl: ""
};

export default function Certificates({ enableNext }) {
  const { resumeInfo = {}, setResumeInfo } = useContext(ResumeInfoContext);
  const { resumeId } = useParams();

  const [certificates, setCertificates] = useState(
    Array.isArray(resumeInfo.certificates) && resumeInfo.certificates.length
      ? resumeInfo.certificates
      : [emptyCertificate]
  );
  const [globalFile, setGlobalFile] = useState(resumeInfo.certificateUrl || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(resumeInfo.certificates) && resumeInfo.certificates.length) {
      setCertificates(resumeInfo.certificates);
      enableNext(true);
    }
    if (resumeInfo.certificateUrl) {
      setGlobalFile(resumeInfo.certificateUrl);
    }
  }, [resumeInfo.certificates, resumeInfo.certificateUrl, enableNext]);

  const addEntry = () => {
    const next = certificates.concat(emptyCertificate);
    setCertificates(next);
    setResumeInfo(r => ({ ...r, certificates: next }));
    enableNext(false);
  };

  const removeEntry = idx => {
    const next = certificates.filter((_, i) => i !== idx);
    setCertificates(next);
    setResumeInfo(r => ({ ...r, certificates: next }));
    enableNext(next.length > 0 || !!globalFile);
  };

  const handleChange = (idx, field, value) => {
    const next = certificates.map((c, i) =>
      i === idx ? { ...c, [field]: value } : c
    );
    setCertificates(next);
    setResumeInfo(r => ({ ...r, certificates: next }));
    enableNext(false);
  };

  const handleGlobalFile = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("files", file);
    try {
      const upl = await GlobalAPI.UploadFile(fd);
      const uploaded = upl.data[0];
      setGlobalFile(uploaded);
      setResumeInfo(r => ({ ...r, certificateUrl: uploaded }));
      toast.success("Global PDF attached");
      enableNext(certificates.length > 0);
    } catch {
      toast.error("Upload failed");
    }
  };

  const onSave = async () => {
    setLoading(true);
    const certificatesPayload = certificates.map(c => ({
      title: c.title,
      issuer: c.issuer,
      issuerDate: c.issuerDate,
      credentialUrl: c.credentialUrl
    }));

    const data = {
      certificates: certificatesPayload,
      certificateUrl: getMediaId(globalFile)
    };
    try {
      await GlobalAPI.UpdateResumeDetail(resumeId, { data });
      toast.success("Certificates saved successfully");
      enableNext(true);
    } catch {
      toast.error("Failed to save certificates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-blue-900 border-t-4 mt-10">
      <h2 className="font-bold text-lg">Certificates</h2>
      <p>Add your certificates</p>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer text-sm px-3 py-1 bg-gray-100 border rounded flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Single PDF
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleGlobalFile}
            />
          </label>
          {globalFile?.url && (
            <a
              href={`http://localhost:1337${globalFile.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <FileText className="w-4 h-4" /> {globalFile.name}
            </a>
          )}
        </div>
        <p className="text-xs text-gray-500 italic">
          Please upload a single PDF containing all your certifications
        </p>
      </div>

      {certificates.map((c, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-3 p-3 my-5 rounded-lg border">
          <div className="col-span-2 flex justify-between items-center">
            <h3 className="font-semibold text-sm">Certificate {idx + 1}</h3>
            <Button variant="outline" size="sm" className="border-blue-900 text-primary flex items-center gap-2" onClick={() => removeEntry(idx)}>
              <Trash2 className="w-4 h-4 mr-1" /> Remove
            </Button>
          </div>
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="border p-2 rounded text-sm"
            value={c.title}
            onChange={e => handleChange(idx, "title", e.target.value)}
          />
          <input
            type="text"
            name="issuer"
            placeholder="Issuer"
            className="border p-2 rounded text-sm"
            value={c.issuer}
            onChange={e => handleChange(idx, "issuer", e.target.value)}
          />
          <input
            type="date"
            name="issuerDate"
            className="border p-2 rounded text-sm"
            value={c.issuerDate}
            onChange={e => handleChange(idx, "issuerDate", e.target.value)}
          />
          <input
            type="url"
            name="credentialUrl"
            placeholder="Credential URL"
            className="border p-2 rounded text-sm"
            value={c.credentialUrl}
            onChange={e => handleChange(idx, "credentialUrl", e.target.value)}
          />
        </div>
      ))}

      <div className="flex justify-between mt-4">
        <div className="space-x-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Add More Certificates
          </Button>
        </div>
        <Button onClick={onSave} disabled={loading}>
          {loading 
            ? <LoaderCircle className="animate-spin w-4 h-4 mr-1"/>
            : "Save"
          }
        </Button>
      </div>
    </div>
  );
}
