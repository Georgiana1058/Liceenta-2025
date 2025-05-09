import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ResumeInfoContext } from "@/context/ResumeInfoContext";
import GlobalAPI from "../../../../../../service/GlobalAPI";
import model from "../../../../../../service/AIModal";
import { Plus, Trash2, Brain, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const emptyProject = {
  projectTitle: "",
  description: "",
  link: ""
};

export default function Portofolio({ enableNext }) {
  const { resumeInfo = {}, setResumeInfo } = useContext(ResumeInfoContext);
  const { resumeId } = useParams();

  const [projects, setProjects] = useState(
    Array.isArray(resumeInfo.portofolio) && resumeInfo.portofolio.length
      ? resumeInfo.portofolio
      : [emptyProject]
  );
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(null);

  useEffect(() => {
    if (Array.isArray(resumeInfo.portofolio) && resumeInfo.portofolio.length) {
      setProjects(resumeInfo.portofolio);
      enableNext(true);
    }
  }, [resumeInfo.portofolio, enableNext]);

  const addEntry = () => {
    const next = [...projects, emptyProject];
    setProjects(next);
    setResumeInfo(r => ({ ...r, portofolio: next }));
    enableNext(false);
  };

  const removeEntry = idx => {
    const next = projects.filter((_, i) => i !== idx);
    setProjects(next);
    setResumeInfo(r => ({ ...r, portofolio: next }));
    enableNext(next.length > 0);
  };

  const handleChange = (idx, field, value) => {
    const next = projects.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    setProjects(next);
    setResumeInfo(r => ({ ...r, portofolio: next }));
    enableNext(false);
  };

  const generateWithAI = async (idx) => {
    const { projectTitle, description } = projects[idx];
    const prompt = `
You are a professional resume writer crafting the Portfolio section of an ideal CV.
Using only the context below, generate a concise 2–3 sentence description highlighting the project's purpose, key responsibilities, technologies used, and skills demonstrated.
Do not repeat the input values themselves—focus on what was accomplished and learned.

Context:
- Project Title: "${projectTitle}"
- User keywords: "${description}"

Return only the description text.
    `.trim();

    setLoadingIdx(idx);
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = await response.text();
      text = text.replace(/```json|```/g, '').trim();

      const next = projects.map((p, i) =>
        i === idx ? { ...p, description: text } : p
      );
      setProjects(next);
      setResumeInfo(r => ({ ...r, portofolio: next }));
      toast.success('AI suggestion applied!');
      enableNext(true);
    } catch {
      toast.error('AI generation failed');
    } finally {
      setLoadingIdx(null);
    }
  };

  const onSave = async () => {
    setLoadingSave(true);
    const payload = projects.map(({ projectTitle, description, link }) => ({
      projectTitle,
      description,
      link
    }));
    try {
      await GlobalAPI.UpdateResumeDetail(resumeId, { data: { portofolio: payload } });
      toast.success("Portfolio saved!");
      enableNext(true);
    } catch {
      toast.error("Error saving portfolio");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-blue-900 border-t-4 mt-10">
      <h2 className="font-bold text-lg">Portfolio</h2>
      <p>Add your projects</p>

      {projects.map((p, idx) => (
        <div
          key={idx}
          className="grid grid-cols-2 gap-3 p-3 my-5 rounded-lg border"
        >
          <div className="col-span-2 flex justify-between items-center">
            <h3 className="font-semibold text-sm">Project {idx + 1}</h3>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-900 text-primary flex items-center gap-2"
              onClick={() => removeEntry(idx)}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Remove
            </Button>
          </div>

          <input
            type="text"
            name="projectTitle"
            placeholder="Project Title"
            className="border p-2 rounded text-sm"
            value={p.projectTitle}
            onChange={e => handleChange(idx, "projectTitle", e.target.value)}
          />

          <textarea
            name="description"
            placeholder="Description"
            className="border p-2 rounded text-sm col-span-2"
            rows={3}
            value={p.description}
            onChange={e => handleChange(idx, "description", e.target.value)}
          />

          <div className="col-span-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-900 text-primary flex items-center gap-2"
              onClick={() => generateWithAI(idx)}
              disabled={loadingIdx === idx}
            >
              <Brain className="h-4 w-4" />
              {loadingIdx === idx && <LoaderCircle className="animate-spin w-4 h-4 mr-1" />}
              Generate with AI
            </Button>
          </div>

          <input
            type="url"
            name="link"
            placeholder="Project Link (https://...)"
            className="border p-2 rounded text-sm col-span-2"
            value={p.link}
            onChange={e => handleChange(idx, "link", e.target.value)}
          />
        </div>
      ))}

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={addEntry}>
          <Plus className="w-4 h-4 mr-1" /> Add More Projects
        </Button>
        <Button onClick={onSave} disabled={loadingSave}>
          {loadingSave
            ? <LoaderCircle className="animate-spin w-4 h-4 mr-1" />
            : "Save Portfolio"
          }
        </Button>
      </div>
    </div>
  );
}
