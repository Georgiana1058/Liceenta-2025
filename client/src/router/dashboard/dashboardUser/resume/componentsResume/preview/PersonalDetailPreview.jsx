import React from 'react'
import { Linkedin, Github, Mail, Phone, User } from 'lucide-react'

function PersonalDetailPreview({ resumeInfo }) {
  return (
    <div>
      <div className="flex justify-center mb-2">
      {resumeInfo?.photoUrl?.[0]?.url ? (
  <img
    src={`http://localhost:1337${resumeInfo.photoUrl[0].url}`}
    alt="Profile"
    className="w-20 h-20 object-cover rounded-full"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = '/fallback-avatar.png';
    }}
  />
)  : (
  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
    <User className="text-gray-500" />
  </div>
)}

        
      </div>

      <h2 className="font-bold text-xl text-center" style={{ color: resumeInfo?.themeColor }}>
        {resumeInfo?.firstName} {resumeInfo?.lastName}
      </h2>
      <h2 className="text-center text-sm font-medium">{resumeInfo?.jobTitle}</h2>
      <h2 className="text-center font-normal text-xs" style={{ color: resumeInfo?.themeColor }}>
        {resumeInfo?.address}
      </h2>

      <div className="flex justify-between items-center text-xs font-normal my-2" style={{ color: resumeInfo?.themeColor }}>
        <span className="flex items-center gap-1">
          <Phone className="w-3 h-3" /> {resumeInfo?.phone}
        </span>
        <span className="flex items-center gap-1">
          <Mail className="w-3 h-3" /> {resumeInfo?.email}
        </span>
      </div>

      <div className="flex justify-center gap-4 text-xs underline text-blue-600">
        {resumeInfo?.linkedin && (
          <a href={resumeInfo.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1">
            <Linkedin className="w-3 h-3" /> LinkedIn
          </a>
        )}
        {resumeInfo?.github && (
          <a href={resumeInfo.github} target="_blank" rel="noreferrer" className="flex items-center gap-1">
            <Github className="w-3 h-3" /> GitHub
          </a>
        )}
      </div>

      <hr className="border-[1.5px] my-2" style={{ borderColor: resumeInfo?.themeColor }} />
    </div>
  )
}

export default PersonalDetailPreview
