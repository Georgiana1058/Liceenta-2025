import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import React, { useContext } from 'react';
import PersonalDetailPreview from '../componentsResume/preview/PersonalDetailPreview';
import SummeryPreview from '../componentsResume/preview/SummeryPreview';
import ExperiencePreview from '../componentsResume/preview/ExperiencePreview';
import EducationPreview from '../componentsResume/preview/EducationPreview';
import SkillsPreview from '../componentsResume/preview/SkillsPreview';
import VolunteeringPreview from '../componentsResume/preview/VolunteeringPreview';
import LanguagesPreview from '../componentsResume/preview/LanguagesPreview';
import CertificatesPreview from '../componentsResume/preview/CertificatesPreview';
import PortofolioPreview from '../componentsResume/preview/PortofolioPreview';


function ResumePreview() {

  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  return (
    <div className='shadow-lg h-full p-14 border-t-[20px]'
      style={{ borderColor: resumeInfo?.themeColor }}
    >
      {/** Personal Detail Preview */}
      <PersonalDetailPreview resumeInfo={resumeInfo} />

      {/** Summary Preview */}
      <SummeryPreview resumeInfo={resumeInfo} />

      {/** Education Preview */}
      <EducationPreview resumeInfo={resumeInfo} />

      {/** Professional Experience Preview */}
      <ExperiencePreview resumeInfo={resumeInfo} />

      {/** Portfolio Preview */}
      <PortofolioPreview resumeInfo={resumeInfo} />

      {/** Skills Preview */}
      <SkillsPreview resumeInfo={resumeInfo} />

      {/** Certifications Preview */}
      <CertificatesPreview resumeInfo={resumeInfo} />

      {/** Languages Preview */}
      <LanguagesPreview resumeInfo={resumeInfo} />

      {/** Volunteering Preview */}
      <VolunteeringPreview resumeInfo={resumeInfo} />




    </div>
  )
}

export default ResumePreview