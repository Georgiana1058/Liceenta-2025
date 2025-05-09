import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import { LoaderCircle } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import GlobalAPI from '../../../../../../service/GlobalAPI'
import { toast } from 'sonner'
import { getMediaId } from '@/lib/mediaUtils' // asigură-te că e corect importul

function PersonalDetail({ enableNext }) {
  const params = useParams()
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const resumeId = params.resumeId;

  useEffect(() => {
    GlobalAPI.GetResumeById(resumeId).then((res) => {
      const allData = res.data.data.attributes || {}
      const photo = allData?.photoUrl

      setResumeInfo((prev) => ({
        ...prev,
        ...allData,
      }))

      // fallback pentru imagine dacă nu este complet populată
      if (!photo?.url && photo?.data?.attributes?.url) {
        setResumeInfo((prev) => ({
          ...prev,
          photoUrl: [
            {
              id: photo.data.id,
              url: photo.data.attributes.url,
              name: photo.data.attributes.name,
            },
          ],
        }))
      }
    })
  }, [])

  const handleInputChange = (e) => {
    enableNext(false)
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setResumeInfo({
      ...resumeInfo,
      [name]: value,
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('files', file)

    try {
      const response = await GlobalAPI.UploadFile(formDataUpload)
      const uploadedImage = response.data[0]

      // salvează doar ID pentru trimitere în backend
      setFormData((prev) => ({ ...prev, photoUrl: uploadedImage.id }))

      // preview local
      setResumeInfo((prev) => ({
        ...prev,
        photoUrl: [
          {
            id: uploadedImage.id,
            url: uploadedImage.url,
            name: uploadedImage.name,
          },
        ],
      }))

      toast.success('Image uploaded!')
    } catch (error) {
      toast.error('Image upload failed')
    }
  }
  const onSave = async (e) => {
    e.preventDefault()
    setLoading(true)
  
    const imageId = getMediaId(formData.photoUrl) || getMediaId(resumeInfo.photoUrl)
  
    const data = {
      data: {
        firstName: formData.firstName || resumeInfo.firstName,
        lastName: formData.lastName || resumeInfo.lastName,
        jobTitle: formData.jobTitle || resumeInfo.jobTitle,
        address: formData.address || resumeInfo.address,
        phone: formData.phone || resumeInfo.phone,
        email: formData.email || resumeInfo.email,
        linkedin: formData.linkedin || resumeInfo.linkedin,
        github: formData.github || resumeInfo.github,
        photoUrl: imageId,
      },
    }
  
    console.log("Trimitem la Strapi:", data)
  
    try {
      await GlobalAPI.UpdateResumeDetail(resumeId, data)
      toast.success('Details updated!')
      enableNext(true)
    } catch (error) {
      console.error('Eroare STRAPI:', error)
      toast.error('Failed to update details')
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-blue-900 border-t-4 mt-10">
      <h2 className="font-bold text-lg">Personal Detail</h2>
      <p>Get Started with the basic information</p>

      <form onSubmit={onSave}>
        <div className="grid grid-cols-2 mt-5 gap-3">
          <div>
            <label className="text-sm">First Name</label>
            <Input name="firstName" defaultValue={resumeInfo?.firstName} required onChange={handleInputChange} />
          </div>

          <div>
            <label className="text-sm">Last Name</label>
            <Input name="lastName" defaultValue={resumeInfo?.lastName} required onChange={handleInputChange} />
          </div>

          <div className="col-span-2">
            <label className="text-sm">Job Title</label>
            <Input name="jobTitle" defaultValue={resumeInfo?.jobTitle} required onChange={handleInputChange} />
          </div>

          <div className="col-span-2">
            <label className="text-sm">Address</label>
            <Input name="address" defaultValue={resumeInfo?.address} required onChange={handleInputChange} />
          </div>

          <div>
            <label className="text-sm">Phone</label>
            <Input name="phone" defaultValue={resumeInfo?.phone} required onChange={handleInputChange} />
          </div>

          <div>
            <label className="text-sm">Email</label>
            <Input name="email" defaultValue={resumeInfo?.email} required onChange={handleInputChange} />
          </div>

          <div className="col-span-2">
            <label className="text-sm">Upload Photo</label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />

            {resumeInfo?.photoUrl?.[0]?.name && (
              <p className="text-xs mt-1 text-gray-500">
                Fișier existent: {resumeInfo.photoUrl[0].name}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm">LinkedIn</label>
            <Input name="linkedin" defaultValue={resumeInfo?.linkedin} onChange={handleInputChange} />
          </div>

          <div>
            <label className="text-sm">GitHub</label>
            <Input name="github" defaultValue={resumeInfo?.github} onChange={handleInputChange} />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" /> : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PersonalDetail
