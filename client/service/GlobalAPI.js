import axios from "axios";
const API_KEY = import.meta.env.VITE_STRAPI_API_KEY;
const axiosClient=axios.create({
    baseURL:'http://localhost:1337/api/',
    headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${API_KEY}`
    }
})

const CreateNewResume=(data)=>axiosClient.post('/user-resumes',data)

const GetUserResumes=(userEmail)=>axiosClient.get('/user-resumes?filters[userEmail][$eq]='+userEmail);

const UpdateResumeDetail=(id,data)=>axiosClient.put('/user-resumes/'+id,data);

const GetResumeById=(id)=>axiosClient.get('/user-resumes/'+id+'?populate=*')

const DeleteResumeById=(id)=>axiosClient.delete('/user-resumes/'+id)

const GetResumePhoto = (id) =>
    axiosClient.get('/user-resumes/'+id+'?populate=photoUrl');
  
const GetResumeCertificatesFile = (id) =>
    axiosClient.get(
      `/user-resumes/${id}?populate[certificates][populate]=certificateFile`
    )
  

const UploadFile = (formData) =>
    axiosClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

const GetUsersByClerkId = clerkUserId =>
    axiosClient.get(
      `/users?filters[clerkUserId][$eq]=${clerkUserId}&populate=role`
    );

export default{
    CreateNewResume,
    GetUserResumes,
    UpdateResumeDetail,
    GetResumeById,
    DeleteResumeById,
    UploadFile,
    GetResumePhoto,
    GetResumeCertificatesFile,
    GetUsersByClerkId,
}