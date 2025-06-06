// src/context/ResumeInfoContext.jsx
import React, { createContext, useState } from 'react';

export const ResumeInfoContext = createContext();

export function ResumeInfoProvider({ children }) {
  const defaultResume = {
    title:       '',
    resumeId:    '',
    userEmail:   '',
    userName:    '',
    firstName:   '',
    lastName:    '',
    address:     '',
    jobTitle:    '',
    phone:       '',
    email:       '',
    summery:     '',
    themeColor:  '#0A2540',
    photoUrl:    null,      // media relationship
    linkedin:    '',
    github:      '',
    education:   [],        // componente repeatable
    skills:      [],
    experience:  [],
    volunteering: [], // new section for volunteering
    languages:   [], // new section for languages
    certificates: [], // new section for certificates
    portofolio: [],
  };

  const [resumeInfo, setResumeInfo] = useState(defaultResume);

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>
      {children}
    </ResumeInfoContext.Provider>
  );
}
