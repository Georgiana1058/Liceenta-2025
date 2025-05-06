import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import GlobalAPI from '../../../../../../service/GlobalAPI'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import RichTextEditor from '../RichTextEditor'

const emptyEntry = {
  title: '',
  companyName: '',
  city: '',
  state: '',
  startDate: '',
  endDate: '',
  workSummery: ''
}

export default function Experience() {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const { resumeId } = useParams()
  const [experienceList, setExperienceList] = useState([emptyEntry])
  const [loading, setLoading] = useState(false)

  // 1) la mount (sau când resumeInfo.experience se schimbă), hydrate din context
  useEffect(() => {
    if (Array.isArray(resumeInfo.experience) && resumeInfo.experience.length) {
      setExperienceList(resumeInfo.experience)
    }
  }, [resumeInfo.experience])

  // 2) când modificăm vreun câmp simplu
  const handleChange = (idx, e) => {
    const { name, value } = e.target
    setExperienceList(list => {
      const copy = [...list]
      copy[idx] = { ...copy[idx], [name]: value }
      return copy
    })
  }

  // 3) când editorul rich text trimite summary-ul
  const handleRichTextEditor = (e, field, idx) => {
    const value = e.target.value
    setExperienceList(list => {
      const copy = [...list]
      copy[idx] = { ...copy[idx], [field]: value }
      return copy
    })
  }

  // 4) adaugă / elimină intrări
  const addEntry = () => {
    setExperienceList(list => [...list, emptyEntry])
  }
  const removeEntry = () => {
    setExperienceList(list => (list.length > 1 ? list.slice(0, -1) : list))
  }

  // 5) la Salvare: trimite la API și apoi actualizează contextul
  const onSave = () => {
    setLoading(true)
    const payload = {
      data: {
        experience: experienceList.map(({ id, ...rest }) => rest)
      }
    }
    GlobalAPI.UpdateResumeDetail(resumeId, payload)
      .then(() => {
        setResumeInfo({ ...resumeInfo, experience: experienceList })
        toast.success('Experience details updated!')
      })
      .catch(() => {
        toast.error('Server Error, please try again.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-blue-900 border-t-4 mt-10">
      <h2 className="font-bold text-lg">Professional Experience</h2>
      <p>Add Your previous Job experience</p>

      {experienceList.map((item, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-3 border p-3 rounded-lg mb-4">
          <div>
            <label className="text-xs">Position Title</label>
            <Input
              name="title"
              value={item.title}
              onChange={e => handleChange(idx, e)}
            />
          </div>
          <div>
            <label className="text-xs">Company Name</label>
            <Input
              name="companyName"
              value={item.companyName}
              onChange={e => handleChange(idx, e)}
            />
          </div>
          <div>
            <label className="text-xs">City</label>
            <Input
              name="city"
              value={item.city}
              onChange={e => handleChange(idx, e)}
            />
          </div>
          <div>
            <label className="text-xs">State</label>
            <Input
              name="state"
              value={item.state}
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
            <RichTextEditor
              index={idx}
              defaultValue={item.workSummery}
              positionTitle={item.title}
              onRichTextEditorChange={e => handleRichTextEditor(e, 'workSummery', idx)}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        <div className="space-x-2">
          <Button variant="outline" onClick={addEntry}>
            + Add More Experience
          </Button>
          <Button variant="outline" onClick={removeEntry}>
            – Remove
          </Button>
        </div>
        <Button onClick={onSave} disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin" /> : 'Save'}
        </Button>
      </div>
    </div>
  )
}
