import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Brain, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import GlobalAPI from '../../../../../../service/GlobalAPI'
import model from '../../../../../../service/AIModal'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'

const emptyVolunteering = {
  title: '',
  description: ''
}

export default function Volunteering({ enableNext }) {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const { resumeId } = useParams()

  const [volunteeringList, setVolunteeringList] = useState([emptyVolunteering])
  const [loadingIdx, setLoadingIdx] = useState(null)

  // initialize from context
  useEffect(() => {
    if (Array.isArray(resumeInfo.volunteering) && resumeInfo.volunteering.length) {
      setVolunteeringList(resumeInfo.volunteering)
      enableNext(true)
    }
  }, [resumeInfo.volunteering, enableNext])

  const handleChange = (idx, e) => {
    const { name, value } = e.target
    const next = volunteeringList.map((item, i) =>
      i === idx ? { ...item, [name]: value } : item
    )
    setVolunteeringList(next)
    setResumeInfo({ ...resumeInfo, volunteering: next })
    enableNext(false)
  }

  const addEntry = () => {
    const next = [...volunteeringList, emptyVolunteering]
    setVolunteeringList(next)
    setResumeInfo({ ...resumeInfo, volunteering: next })
    enableNext(false)
  }

  const removeEntry = () => {
    const next =
      volunteeringList.length > 1
        ? volunteeringList.slice(0, -1)
        : volunteeringList
    setVolunteeringList(next)
    setResumeInfo({ ...resumeInfo, volunteering: next })
    enableNext(next.length > 0)
  }

  const onSave = () => {
    const payload = {
      data: {
        volunteering: volunteeringList.map(({ id, ...rest }) => rest)
      }
    }
    GlobalAPI.UpdateResumeDetail(resumeId, payload)
      .then(() => {
        toast.success('Volunteering experience saved!')
        enableNext(true)
      })
      .catch(() => toast.error('Error saving volunteering experience'))
  }

  const generateWithAI = async (idx) => {
    const { title, description } = volunteeringList[idx]
    const prompt = `
You are a professional resume writer crafting the Volunteering section of an ideal student CV.
Using only the context below, generate a concise 2–3 sentence description highlighting the role's key responsibilities, skills gained, and impact.
Do not repeat the input values—focus solely on what the volunteer achieved and learned.

Context:
- Role Title: "${title}"
- User keywords: "${description}"

Return only the description text.
    `.trim()

    setLoadingIdx(idx)
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      let text = await response.text()
      text = text.replace(/```json|```/g, '').trim()

      const next = volunteeringList.map((item, i) =>
        i === idx ? { ...item, description: text } : item
      )
      setVolunteeringList(next)
      setResumeInfo({ ...resumeInfo, volunteering: next })
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
      <h2 className="font-bold text-lg">Volunteering Experience</h2>
      <p>Add your volunteering details</p>

      {volunteeringList.map((item, idx) => (
        <div
          key={idx}
          className="grid grid-cols-2 gap-3 p-3 my-5 rounded-lg border"
        >
          <div className="col-span-2">
            <label className="text-xs">Role Title</label>
            <Input
              name="title"
              value={item.title}
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
        </div>
      ))}

      <div className="flex justify-between mt-4">
        <div className="space-x-2">
          <Button variant="outline" onClick={addEntry}>
            + Add More Volunteering
          </Button>
          <Button variant="outline" onClick={removeEntry}>
            – Remove
          </Button>
        </div>
        <Button onClick={onSave}>
          Save Volunteering
        </Button>
      </div>
    </div>
  )
}
