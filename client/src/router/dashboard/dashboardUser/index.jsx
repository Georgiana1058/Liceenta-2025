import React, { useEffect, useState } from 'react';
import AddResume from './components/AddResume'
import { useUser } from '@clerk/clerk-react'
import GlobalAPI from '../../../../service/GlobalAPI';
import ResumeCardItem from './components/ResumeCardItem';
import Header from '@/components/header-custom/Header';
import ClerkSyncToStrapi from '@/router/auth/ClerkSyncToStrapi';


function Dashboard() {
  const{user}=useUser();
  const[resumeList,setResumeList]=useState([]);
 

  useEffect(()=>{
    user&&GetResumeList()
  },[user])

 /** Returnez lista de cv-uri ->GET */

 const GetResumeList = async () => {
  try {
    const resumesRes = await GlobalAPI.GetUserResumes(user?.primaryEmailAddress?.emailAddress);
    const resumes = resumesRes?.data?.data || [];

    const notifRes = await GlobalAPI.GetAllNotifications();
    const allNotifications = notifRes?.data?.data || [];

    const enrichedResumes = resumes.map((resume) => {
      const relatedNotif = allNotifications.find(
        (notif) =>
          (notif.type === 'approval_request') &&
          notif?.user_resume?.documentId === resume.documentId
      );

      return {
        ...resume,
        feedbackScore: relatedNotif?.feedbackScore ?? null,
      };
    });

    setResumeList(enrichedResumes);
  } catch (err) {
    console.error("❌ Error loading resumes with scores:", err);
  }
};

  return (
    <div>
    <div>
    <Header/>
  </div>

    <div className='p-10 md:px-20 lg:px-32'>
    <ClerkSyncToStrapi/>
      <h2 className='font-bold text-3xl'>My Resume</h2>
      <p>Start Creating AI resume to your next role Job</p>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-5
      lg:grid-cols-5
      mt-10 
      '>
      <AddResume/>
      {resumeList.length>0&&resumeList.map((resume,index)=>( 
        <ResumeCardItem resume={resume} key={index} refreshData={GetResumeList}/>
      ))}
      </div>
      
    </div>
    </div>
  )
}

export default Dashboard