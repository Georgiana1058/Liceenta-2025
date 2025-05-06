import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import GlobalAPI from '../../../../../../service/GlobalAPI'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'

const emptyEducation = {
  universityName: '',
  degree: '',
  major: '',
  startDate: '',
  endDate: '',
  description: ''
}

export default function Education() {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const { resumeId } = useParams()

  // 1️⃣ stare locală
  const [educationalList, setEducationalList] = useState([emptyEducation])
  const [loading, setLoading] = useState(false)

  // 2️⃣ initializează la mount
  useEffect(() => {
    if (Array.isArray(resumeInfo.education) && resumeInfo.education.length) {
      setEducationalList(resumeInfo.education)
    }
    // doar la mount, aşa că dependenţe goale:
  }, [])

  // 3️⃣ handler‑e care **sincronizează** contextul **doar** în event‑uri
  const handleChange = (idx, e) => {
    const { name, value } = e.target
    const next = educationalList.map((item,i) =>
      i === idx ? { ...item, [name]: value } : item
    )
    setEducationalList(next)
    setResumeInfo({ ...resumeInfo, education: next })
  }

  const addEntry = () => {
    const next = [...educationalList, emptyEducation]
    setEducationalList(next)
    setResumeInfo({ ...resumeInfo, education: next })
  }

  const removeEntry = () => {
    const next = educationalList.length > 1
      ? educationalList.slice(0, -1)
      : educationalList
    setEducationalList(next)
    setResumeInfo({ ...resumeInfo, education: next })
  }

  // 4️⃣ salvare
  const onSave = () => {
    setLoading(true)
    const payload = {
      data: { education: educationalList.map(({ id, ...rest }) => rest) }
    }
    GlobalAPI.UpdateResumeDetail(resumeId, payload)
      .then(() => toast.success('Education updated!'))
      .catch(() => toast.error('Server Error'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-blue-900 border-t-4 mt-10">
      <h2 className="font-bold text-lg">Education</h2>
      <p>Add your education details</p>

      {educationalList.map((item, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-3 p-3 my-5 rounded-lg border">
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
        <Button onClick={onSave} disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin"/> : 'Save'}
        </Button>
      </div>
    </div>
  )
}
