import React, { useEffect,useState } from 'react';
import { useParams } from 'react-router-dom';
import FormSection from '../../componentsResume/FormSection';
import ResumePreview from '../../componentsResume/ResumePreview';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import dummy from '@/router/data/dummy';
import GlobalAPI from '../../../../../../../service/GlobalAPI';
import Header from '@/components/header-custom/Header';

function EditResume() {
  const {resumeId} = useParams();
  const [resumeInfo,setResumeInfo]=useState();

  useEffect(() => {
    GetResumeInfo();
  }, []);

  const GetResumeInfo=()=>{
    GlobalAPI.GetResumeById(resumeId).then(resp=>{
      setResumeInfo(resp.data.data);
    })

  }

  return (
    <ResumeInfoContext.Provider value={{resumeInfo,setResumeInfo}} >
      <Header/>
      <div className='grid grid-cols-1 md:grid-cols-2 p-10 gap-10'>
      {/** Form Section */}
      <FormSection/>

      {/** Priview Section */}
      <ResumePreview/>
    </div>
    </ResumeInfoContext.Provider>
    
  );
}

export default EditResume;
