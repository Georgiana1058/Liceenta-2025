import React from 'react'

function SkillsPreview({resumeInfo}) {
  return (
    <div>
        <div className='my-6'>
        <h2 className='text-center font-bold text-sm mb-2'
         style={{
            color:resumeInfo?.themeColor
        }}
        
        >Skills</h2>
        <hr style={{
            borderColor:resumeInfo?.themeColor
        }}/>
        </div>
        <div className='grid grid-cols-2 gap-3 my-4'>
        {Array.isArray(resumeInfo?.skills) &&
  resumeInfo.skills.map((skill, index) => (
    <div key={index} className="flex items-center justify-between">
      <h2 className="text-xs">{skill.name}</h2>
      <div className="h-2 w-[120px] skill-bar">
      <div className="h-2 w-[120px] skill-bar">
      <div className="h-2 w-[120px] skill-bar">
      <div className="h-2 w-[120px] border border-gray-300 skill-bar">
  <div
    className="h-full skill-bar-fill"
    style={{
      width: skill?.rating * 20 + '%',
      backgroundColor: resumeInfo?.themeColor,
    }}
  ></div>
</div>
</div>
</div>
</div>
    </div>
))}
        </div>

    </div>
  )
}

export default SkillsPreview