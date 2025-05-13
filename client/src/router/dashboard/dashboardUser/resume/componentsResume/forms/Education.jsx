// src/components/dashboard/resume/forms/Education.jsx
import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Brain, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import GlobalAPI from "../../../../../../../service/GlobalAPI"
import model from '../../../../../../../service/AIModal'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'

const emptyEducation = {
  universityName: '',
  degree: '',
  major: '',
  startDate: '',
  endDate: '',
  description: ''
}

export default function Education({ enableNext }) {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const { resumeId } = useParams()

  const [educationalList, setEducationalList] = useState([emptyEducation])
  const [loadingIdx, setLoadingIdx] = useState(null)

  useEffect(() => {
    if (Array.isArray(resumeInfo.education) && resumeInfo.education.length) {
      const norm = resumeInfo.education.map(item => ({
        ...item,
        endDate: typeof item.endDate === 'string' ? item.endDate : ''
      }))
      setEducationalList(norm)
      enableNext(true)
    }
  }, [resumeInfo.education, enableNext])

  const handleChange = (idx, e) => {
    const { name, value } = e.target
    const next = educationalList.map((item, i) =>
      i === idx ? { ...item, [name]: value } : item
    )
    setEducationalList(next)
    setResumeInfo({ ...resumeInfo, education: next })
    enableNext(false)
  }

  const addEntry = () => {
    const next = [...educationalList, emptyEducation]
    setEducationalList(next)
    setResumeInfo({ ...resumeInfo, education: next })
    enableNext(false)
  }

  const removeEntry = () => {
    const next = educationalList.length > 1
      ? educationalList.slice(0, -1)
      : educationalList
    setEducationalList(next)
    setResumeInfo({ ...resumeInfo, education: next })
    enableNext(next.length > 0)
  }

  const onSave = () => {
    const payload = {
      data: {
        education: educationalList.map(({ id, ...rest }) => ({
          ...rest,
          endDate: rest.endDate || null
        }))
      }
    }
    GlobalAPI.UpdateResumeDetail(resumeId, payload)
      .then(() => {
        toast.success('Education updated!')
        enableNext(true)
      })
      .catch(() => toast.error('Server Error'))
  }

  // Generare AI pentru intrarea idx
  const generateWithAI = async (idx) => {
    const { universityName, degree, major, description } = educationalList[idx]
    const prompt = `
You are a professional resume writer crafting the Education section of an ideal student CV.
Using only the context below, generate a concise 2–3 sentence description that explains which academic subjects, technologies, programming languages, and broader skills a student would have acquired by completing this degree.
Do not repeat or paraphrase the input values themselves—focus solely on what the student learned.

Context:
- University Name: "${universityName}"
- Degree: "${degree}"
- Major: "${major}"
- User keywords: "${description}"

Return only the description text.
    `.trim()

    setLoadingIdx(idx)
    try {
      const result   = await model.generateContent(prompt)
      const response = await result.response
      let text       = await response.text()
      text = text.replace(/```json|```/g, '').trim()

      const nextList = educationalList.map((item, i) =>
        i === idx ? { ...item, description: text } : item
      )
      setEducationalList(nextList)
      setResumeInfo({ ...resumeInfo, education: nextList })
      toast.success('AI suggestion applied!')
      enableNext(true)
    } catch {
      toast.error('AI generation failed')
    } finally {
      setLoadingIdx(null)
    }
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-blue-900 border-t-4 mt-10">
      <h2 className="font-bold text-lg">Education</h2>
      <p>Add your education details</p>

      {educationalList.map((item, idx) => (
        <div
          key={idx}
          className="grid grid-cols-2 gap-3 p-3 my-5 rounded-lg border"
        >
          {/* Input fields */}
          <div className="col-span-2">
            <label className="text-xs">University Name</label>
            <Input
              name="universityName"
              value={item.universityName}
              onChange={e => handleChange(idx, e)}
            />
          </div>
          <div>
            <label className="text-xs">Degree</label>
            <Input
              name="degree"
              value={item.degree}
              onChange={e => handleChange(idx, e)}
            />
          </div>
          <div>
            <label className="text-xs">Major</label>
            <Input
              name="major"
              value={item.major}
              onChange={e => handleChange(idx, e)}
            />
          </div>
          <div>
            <label className="text-xs">Start Date</label>
            <Input
              type="date"
              name="startDate"
              value={item.startDate}
              onChange={e => handleChange(idx, e)}
            />
          </div>
          <div>
            <label className="text-xs">End Date</label>
            <Input
              type="date"
              name="endDate"
              value={item.endDate}
              onChange={e => handleChange(idx, e)}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs">Description</label>
            <Textarea
              name="description"
              value={item.description}
              onChange={e => handleChange(idx, e)}
            />
          </div>

          {/* Buton Generate pentru fiecare intrare */}
          <div className="col-span-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-900 text-primary flex items-center gap-2"
              onClick={() => generateWithAI(idx)}
              disabled={loadingIdx === idx}
            ><Brain className='h-4 w-4' />
              {loadingIdx === idx && <LoaderCircle className="animate-spin w-4 h-4 mr-1" />}
              Generate with AI
            </Button>
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-4">
        <div className="space-x-2">
          <Button variant="outline" onClick={addEntry}>
            + Add More Education
          </Button>
          <Button variant="outline" onClick={removeEntry}>
            – Remove
          </Button>
        </div>
        <Button onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  )
}
