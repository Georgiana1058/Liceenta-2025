import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Rating } from '@smastrom/react-rating'
import '@smastrom/react-rating/style.css'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import { toast } from 'sonner'
import GlobalAPI from "../../../../../../../service/GlobalAPI"

export default function Skills() {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const { resumeId } = useParams()

  // 1️⃣ Local state inițializat o singură dată
  const [skillsList, setSkillsList] = useState(() =>
    Array.isArray(resumeInfo.skills) && resumeInfo.skills.length
      ? resumeInfo.skills
      : [{ name: '', rating: 0 }]
  )
  const [loading, setLoading] = useState(false)

  // 2️⃣ Funcție de „sync” care actualizează atât local cât și contextul
  const sync = nextList => {
    setSkillsList(nextList)
    setResumeInfo({ ...resumeInfo, skills: nextList })
  }

  // 3️⃣ Handlerele din formular
  const handleChange = (idx, key, value) => {
    const next = skillsList.map((it, i) =>
      i === idx ? { ...it, [key]: value } : it
    )
    sync(next)
  }

  const addEntry = () => {
    sync([...skillsList, { name: '', rating: 0 }])
  }

  const removeEntry = () => {
    if (skillsList.length === 1) return
    sync(skillsList.slice(0, -1))
  }

  // 4️⃣ Când dai Save, nu mai synchronizăm contextul (e deja up‑to‑date), doar apelăm API‑ul
  const onSave = () => {
    setLoading(true)
    const payload = {
      data: { skills: skillsList.map(({ id, ...rest }) => rest) }
    }
    GlobalAPI.UpdateResumeDetail(resumeId, payload)
      .then(() => toast.success('Skills updated!'))
      .catch(() => toast.error('Server Error, please try again.'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-blue-900 border-t-4 mt-10">
      <h2 className="font-bold text-lg">Skills</h2>
      <p>Add your top professional key skills</p>

      {skillsList.map((item, idx) => (
        <div
          key={idx}
          className="flex justify-between mb-2 border rounded-lg p-3 py-2"
        >
          <div className="flex-1 mr-4">
            <label className="text-xs">Name</label>
            <Input
              value={item.name}
              onChange={e => handleChange(idx, 'name', e.target.value)}
            />
          </div>
          <div>
            <Rating
              style={{ maxWidth: 120 }}
              value={item.rating}
              onChange={v => handleChange(idx, 'rating', v)}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-4">
        <div className="space-x-2">
          <Button variant="outline" onClick={addEntry}>
            + Add More Skill
          </Button>
          <Button variant="outline" onClick={removeEntry}>
            – Remove
          </Button>
        </div>
        <Button disabled={loading} onClick={onSave}>
          {loading ? <LoaderCircle className="animate-spin" /> : 'Save'}
        </Button>
      </div>
    </div>
  )
}
