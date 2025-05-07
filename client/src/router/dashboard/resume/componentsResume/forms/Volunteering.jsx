import React, { useContext, useState } from 'react'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import GlobalAPI from '../../../../../../service/GlobalAPI'

function Volunteering({ enableNext }) {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const [volunteering, setVolunteering] = useState(resumeInfo.volunteering || [])
  const { resumeId } = useParams()

  const handleChange = (index, field, value) => {
    const updated = volunteering.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setVolunteering(updated)
    setResumeInfo({ ...resumeInfo, volunteering: updated })
    if (enableNext) enableNext(true)
  }

  const handleAdd = () => {
    setVolunteering([
      ...volunteering,
      { title: '', description: '' }
    ])
    if (enableNext) enableNext(true)
  }

  const handleRemove = (index) => {
    const updated = volunteering.filter((_, i) => i !== index)
    setVolunteering(updated)
    setResumeInfo({ ...resumeInfo, volunteering: updated })
    if (enableNext) enableNext(updated.length > 0)
  }

  const handleSave = async () => {
    if (volunteering.length === 0) {
      toast.error('Please add at least one volunteering experience')
      if (enableNext) enableNext(false)
      return
    }
  
    const hasEmpty = volunteering.some(
      item => !item.title || !item.description
    )
  
    if (hasEmpty) {
      toast.error('Please fill in all required fields')
      if (enableNext) enableNext(false)
      return
    }
  
    // 🛠 elimină `id`-urile din componente înainte de trimis la Strapi
    const cleanedVolunteering = volunteering.map(({ id, ...rest }) => rest)
  
    try {
      await GlobalAPI.UpdateResumeDetail(resumeId, {
        data: {
          volunteering: cleanedVolunteering
        }
      })
  
      setResumeInfo({ ...resumeInfo, volunteering })
      toast.success('Volunteering experience saved!')
      if (enableNext) enableNext(true)
    } catch (error) {
      toast.error('Error saving volunteering experience')
      console.error(error)
    }
  }
  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Volunteering Experience</h2>
        <Button onClick={handleAdd} variant="outline" size="sm">Add</Button>
      </div>

      {volunteering.map((item, idx) => (
        <div key={idx} className="p-4 border rounded-lg space-y-4">
          <Input
            placeholder="Title*"
            value={item.title}
            onChange={(e) => handleChange(idx, 'title', e.target.value)}
            required
          />
          <Textarea
            placeholder="Description*"
            value={item.description}
            onChange={(e) => handleChange(idx, 'description', e.target.value)}
            required
            rows={3}
          />
          <Button
            onClick={() => handleRemove(idx)}
            variant="destructive"
            size="sm"
          >
            Remove
          </Button>
        </div>
      ))}

      {volunteering.length > 0 && (
        <Button onClick={handleSave} className="w-full">
          Save Volunteering
        </Button>
      )}
    </div>
  )
}

Volunteering.propTypes = {
  enableNext: PropTypes.func
}

export default Volunteering
