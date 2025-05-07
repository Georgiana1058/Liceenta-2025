import React from 'react'

function ExperiencePreview({ resumeInfo }) {
  if (!resumeInfo?.experience?.length) return null
  
  return (
    <div className='my-6'>
      <h2
        className='text-center font-bold text-sm mb-2'
        style={{ color: resumeInfo?.themeColor }}
      >
        Professional Experience
      </h2>
      <hr style={{ borderColor: resumeInfo?.themeColor }} />

      {Array.isArray(resumeInfo?.experience) &&
  resumeInfo.experience.map((experience, index) => (
    <div key={index} className='my-5'>
      <h2
        className='text-sm font-bold'
        style={{ color: resumeInfo?.themeColor }}
      >
        {experience?.title}
      </h2>
      <h2 className='text-xs flex justify-between'>
        {experience?.companyName}, {experience?.city} - {experience?.state}
        <span>
          {experience?.startDate}{' '}
          {experience?.currentlyWorking ? 'Present' : experience?.endDate}
        </span>
      </h2>

      <div
        className="text-xs my-2"
        dangerouslySetInnerHTML={{ __html: experience?.workSummery }}
      />
    </div>
  ))}

    </div>
  )
}

export default ExperiencePreview
