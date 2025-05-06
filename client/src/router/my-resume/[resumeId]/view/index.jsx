import Header from '@/components/header-custom/Header'
import { Button } from '@/components/ui/button'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import ResumePreview from '@/router/dashboard/resume/componentsResume/ResumePreview'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import GlobalAPI from '../../../../../service/GlobalAPI'
import { RWebShare } from 'react-web-share'

function ViewResume() {
    const [resumeInfo, setResumeInfo] = useState();
    const { resumeId } = useParams();
    useEffect(() => {
        GetResumeInfo();
    }, []);

    const GetResumeInfo = () => {
        GlobalAPI.GetResumeById(resumeId).then(resp => {
            console.log(resp.data.data);
            setResumeInfo(resp.data.data);
        })
    }

    const HandleDownload = () => {
        window.print();
    }

    return (
        <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>

            <div id='no-print'>
                <Header />
                <div className='my-10 mx-10 md:mx-20 lg:mx-36'>
                    <h2 className='text-center text-2xl font-medium'>Congrats! Your Ultimate Completed Resume is ready !</h2>
                    <p className='text-center text-gray-400'>Now are ready to download your resume and you can share unique resume url with your friend and family </p>
                    <div className='flex justify-between px-44 my-10'>
                        <Button onClick={HandleDownload}>Downland</Button>
                        <RWebShare
                            data={{
                                text: "Hello, Everyone! This is my resume please open url to see. ",
                                url: import.meta.env.VITE_BASE_URL+'my-resume/'+resumeId+'/view',
                                title: resumeInfo?.firstName+" "+resumeInfo?.lastName+" resume",
                            }}
                            onClick={() => console.log("shared successfully!")}
                        >
                           <Button>Share</Button>
                        </RWebShare>
                        

                    </div>

                </div>
            </div>
            <div className='my-10 mx-10 md:mx-20 lg:mx-36'>
                <div id="print-area">
                    <ResumePreview />
                </div>
            </div>

        </ResumeInfoContext.Provider>
    )
}

export default ViewResume