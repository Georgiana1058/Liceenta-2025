import axios from "axios";
const API_KEY = import.meta.env.VITE_STRAPI_API_KEY;
const axiosClient = axios.create({
  baseURL: 'http://localhost:1337/api/',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
})

const CreateNewResume = (data) => axiosClient.post('/user-resumes', data)

//const GetUserResumes = (userEmail) => axiosClient.get('/user-resumes?filters[userEmail][$eq]=' + userEmail)

const UpdateResumeDetail = (id, data) => axiosClient.put('/user-resumes/' + id, data)

const GetResumeById = (id) => axiosClient.get('/user-resumes/' + id + '?populate=*')

const DeleteResumeById = (id) => axiosClient.delete('/user-resumes/' + id)

const GetResumePhoto = (id) => axiosClient.get('/user-resumes/' + id + '?populate=photoUrl')

const GetResumeCertificatesFile = (id) => axiosClient.get(`/user-resumes/${id}?populate[certificates][populate]=certificateFile`)

const UploadFile = (formData) => axiosClient.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})

const GetUsersByClerkId = (clerkUserId) => axiosClient.get(`/users?filters[clerkUserId][$eq]=${clerkUserId}&populate=role`)

// Calendar
//const CreateCalendarEvent = (data) => axiosClient.post('/calendar-events', { data });
//const GetCalendarEvents = () => axiosClient.get('/calendar-events?populate=*');
//const UpdateCalendarEvent = (id, data) => axiosClient.put(`/calendar-events/${id}`, { data });
//const DeleteCalendarEvent = (id) => axiosClient.delete(`/calendar-events/${id}`);
//const GetAllCompanies = () => axiosClient.get('users?filters[role][name][$eq]=company&populate=role');


// Calendar Events
const GetCalendarEvents = () => axiosClient.get('/calendar-events?populate=*');
const CreateCalendarEvent = (payload) => axiosClient.post('/calendar-events', payload);
const UpdateCalendarEvent = (id, data) => axiosClient.put(`/calendar-events/${id}`, data);
const DeleteCalendarEvent = (id) => axiosClient.delete(`/calendar-events/${id}`);




// Resume
const GetUserResumes = (email) => {
  return axiosClient.get(`/user-resumes?filters[userEmail][$eq]=${email}&populate=*`);
};

// Users with role "company" (ruta completă funcțională!)
const GetAllCompanies = async () => {
  try {
    const res = await axiosClient.get(
      '/users?filters[role][name][$eq]=company&populate=role'
    );
    return res;
  } catch (err) {
    console.error('❌ GetAllCompanies error:', err.response?.data || err.message);
    return { data: { data: [] } }; // fallback gol
  }
};

const GetApprovedCVs = () => axiosClient.get('/cvs?filters[isApproved][$eq]=true&populate[user][fields][0]=email&populate[fields][0]=title');

// Adaugă asta în GlobalAPI.js
const GetAllUsers = async () => {
  return axiosClient.get('/users');
};

const GetCalendarEventById = (id) =>
  axiosClient.get(`/calendar-events/${id}?populate=participants,cv`);


const GetAllNotifications = () => axiosClient.get('/notifications?populate=*');
const CreateNotification = (payload) => axiosClient.post('/notifications', payload);
const UpdateNotification = (id, data) => axiosClient.put(`/notifications/${id}`, data);
const DeleteNotification = (id) => axiosClient.delete(`/notifications/${id}`);
const GetNotificationById = (id) =>
  axiosClient.get(`/notifications/${id}?populate=participant,organizer`);

const GetUserResumesRaw = async (email) => {
  try {
    const res = await axiosClient.get(`/user-resumes?filters[userEmail][$eq]=${email}&populate=*`)
    return res?.data?.data || []
  } catch (err) {
    console.error("❌ GetUserResumesRaw failed:", err)
    return []
  }
}



export default {
  CreateNewResume,
  GetUserResumes,
  UpdateResumeDetail,
  GetResumeById,
  DeleteResumeById,
  UploadFile,
  GetResumePhoto,
  GetResumeCertificatesFile,
  GetUsersByClerkId,
  GetCalendarEvents,
  CreateCalendarEvent,
  UpdateCalendarEvent,
  DeleteCalendarEvent,
  GetAllCompanies,
  GetAllUsers,
  GetApprovedCVs,
  GetCalendarEventById,
  GetAllNotifications,
  CreateNotification,
  UpdateNotification,
  DeleteNotification,
  GetNotificationById,
  GetUserResumesRaw,
} 
