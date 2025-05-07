import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import React, {useContext } from 'react';
import PersonalDetailPreview from '../componentsResume/preview/PersonalDetailPreview';
import SummeryPreview from '../componentsResume/preview/SummeryPreview';
import ExperiencePreview from '../componentsResume/preview/ExperiencePreview';
import EducationPreview from '../componentsResume/preview/EducationPreview';
import SkillsPreview from '../componentsResume/preview/SkillsPreview';
import VolunteeringPreview from '../componentsResume/preview/VolunteeringPreview';


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
        {/** Education Detail */}
        <EducationPreview resumeInfo={resumeInfo}/>
        {/** Volunteering */}
        <VolunteeringPreview resumeInfo={resumeInfo}/>
        {/** Skills */}
        <SkillsPreview resumeInfo={resumeInfo}/>
         {/** Professional Experience */}
         <ExperiencePreview resumeInfo={resumeInfo}/>



    </div>
  )
}

export default ResumePreview