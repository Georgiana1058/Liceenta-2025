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

  useEffect(() => {
    if (Array.isArray(resumeInfo.experience) && resumeInfo.experience.length) {
      setExperienceList(resumeInfo.experience)
    }
  }, [resumeInfo.experience])

  const handleChange = (idx, e) => {
    const { name, value } = e.target
    setExperienceList(list => {
      const copy = [...list]
      copy[idx] = { ...copy[idx], [name]: value }

      // Actualizează contextul live:
      setResumeInfo(prev => ({
        ...prev,
        experience: copy
      }))

      return copy
    })
  }

  const handleRichTextEditor = (e, field, idx) => {
    const value = e.target.value
    setExperienceList(list => {
      const copy = [...list]
      copy[idx] = { ...copy[idx], [field]: value }

      // Actualizează contextul live:
      setResumeInfo(prev => ({
        ...prev,
        experience: copy
      }))

      return copy
    })
  }

  const addEntry = () => {
    setExperienceList(list => {
      const updated = [...list, emptyEntry]
      setResumeInfo(prev => ({
        ...prev,
        experience: updated
      }))
      return updated
    })
  }

  const removeEntry = () => {
    setExperienceList(list => {
      const updated = list.length > 1 ? list.slice(0, -1) : list
      setResumeInfo(prev => ({
        ...prev,
        experience: updated
      }))
      return updated
    })
  }

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
              onRichTextEditorChange={e =>
                handleRichTextEditor(e, 'workSummery', idx)
              }
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
