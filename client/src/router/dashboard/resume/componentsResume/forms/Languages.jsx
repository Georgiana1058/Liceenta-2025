import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import GlobalAPI from '../../../../../../service/GlobalAPI'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const emptyLanguage = {
  languageName: '',
  proficiencyLevel: ''
}

const proficiencyLevels = [
  'Beginner',
  'Intermediate',
  'B1',
  'B2',
  'C1',
  'C2',
  'Fluent',
  'Native'
]

export default function Languages({ enableNext }) {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const { resumeId } = useParams()
  const [languagesList, setLanguagesList] = useState([emptyLanguage])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (Array.isArray(resumeInfo?.languages) && resumeInfo.languages.length) {
      setLanguagesList(resumeInfo.languages)
    }
  }, [resumeInfo?.languages])

  const handleChange = (idx, field, value) => {
    const next = languagesList.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    )
    setLanguagesList(next)
    setResumeInfo({ ...resumeInfo, languages: next })
    if (enableNext) enableNext(true)
  }

  const addEntry = () => {
    const next = [...languagesList, emptyLanguage]
    setLanguagesList(next)
    setResumeInfo({ ...resumeInfo, languages: next })
    if (enableNext) enableNext(true)
  }

  const removeEntry = () => {
    if (languagesList.length === 1) return
    const next = languagesList.slice(0, -1)
    setLanguagesList(next)
    setResumeInfo({ ...resumeInfo, languages: next })
    if (enableNext) enableNext(next.length > 0)
  }

  const onSave = () => {
    setLoading(true)
    const payload = {
      data: {
        languages: languagesList.map(({ id, ...rest }) => rest)
      }
    }
    GlobalAPI.UpdateResumeDetail(resumeId, payload)
      .then(() => toast.success('Languages updated!'))
      .catch(() => toast.error('Server Error, please try again.'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-blue-900 border-t-4 mt-10">
      <h2 className="font-bold text-lg">Languages</h2>
      <p>Add your language proficiencies</p>

      {languagesList.map((item, idx) => (
        <div
          key={idx}
          className="flex justify-between mb-2 border rounded-lg p-3 py-2"
        >
          <div className="flex-1 mr-4">
            <label className="text-xs">Language</label>
            <Input
              value={item.languageName}
              onChange={e => handleChange(idx, 'languageName', e.target.value)}
              placeholder="e.g. English"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs">Proficiency Level</label>
            <Select
              value={item.proficiencyLevel}
              onValueChange={value => handleChange(idx, 'proficiencyLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {proficiencyLevels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-4">
        <div className="space-x-2">
          <Button variant="outline" onClick={addEntry}>
            + Add Language
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