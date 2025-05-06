import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import React, {useContext } from 'react';
import PersonalDetailPreview from './preview/PersonalDetailPreview';
import SummeryPreview from './preview/SummeryPreview';
import ExperiencePreview from './preview/ExperiencePreview';
import EducationPreview from './preview/EducationPreview';
import SkillsPreview from './preview/SkillsPreview';


function ResumePreview() {

    const {resumeInfo,setResumeInfo}=useContext(ResumeInfoContext)
  return (
    <div className='shadow-lg h-full p-14 border-t-[20px]'
    style={{borderColor:resumeInfo?.themeColor}}
    >
        {/** Personal Detail */}
        <PersonalDetailPreview resumeInfo={resumeInfo}/>
        {/** Summery */}
        <SummeryPreview resumeInfo={resumeInfo}/>
        {/** Professional Experience */}
        <ExperiencePreview resumeInfo={resumeInfo}/>
        {/** Education Detail */}
        <EducationPreview resumeInfo={resumeInfo}/>
        {/** Skills */}
        <SkillsPreview resumeInfo={resumeInfo}/>


    </div>
  )
}

export default ResumePreview