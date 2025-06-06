import axios from "axios";

const API_KEY = import.meta.env.VITE_STRAPI_API_KEY;

const axiosClient = axios.create({
  baseURL: 'http://localhost:1337/api/',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
});

// User-resume
const CreateNewResume = (data) => axiosClient.post('/user-resumes', data);
const UpdateResumeDetail = (id, data) => axiosClient.put('/user-resumes/' + id, data);
const GetResumeById = (id) => axiosClient.get('/user-resumes/' + id + '?populate=*');
const DeleteResumeById = (id) => axiosClient.delete('/user-resumes/' + id);
const GetResumePhoto = (id) => axiosClient.get('/user-resumes/' + id + '?populate=photoUrl');
const GetResumeCertificatesFile = (id) => axiosClient.get(`/user-resumes/${id}?populate[certificates][populate]=certificateFile`);
const UploadFile = (formData) => axiosClient.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Salvare utilizator din Clerk în baza de date
const GetUsersByClerkId = (clerkUserId) =>
  axiosClient.get(`/users?filters[clerkUserId][$eq]=${clerkUserId}&populate=role`);

// Calendar Events
const GetCalendarEvents = () => axiosClient.get('/calendar-events?populate=*');
const CreateCalendarEvent = (payload) => axiosClient.post('/calendar-events', payload);
const UpdateCalendarEvent = (id, data) => axiosClient.put(`/calendar-events/${id}`, data);
const DeleteCalendarEvent = (id) => axiosClient.delete(`/calendar-events/${id}`);
const GetCalendarEventById = (id) =>
  axiosClient.get(`/calendar-events/${id}?populate=participants,cv`);

// User Resumes
const GetUserResumes = (email) =>
  axiosClient.get(`/user-resumes?filters[userEmail][$eq]=${email}&populate=*`);
const GetUserResumesRaw = async (email) => {
  try {
    const res = await axiosClient.get(`/user-resumes?filters[userEmail][$eq]=${email}&populate=*`);
    return res?.data?.data || [];
  } catch (err) {
    console.error("❌ GetUserResumesRaw failed:", err);
    return [];
  }
};
const GetUserResumeByResumeId = async (resumeId) =>
  axiosClient.get(`/user-resumes?filters[resumeId][$eq]=${resumeId}&populate=*`);

// Users by roles
const GetAllCompanies = async () => {
  try {
    const res = await axiosClient.get(
      '/users?filters[role][name][$eq]=company&populate=role'
    );
    return res;
  } catch (err) {
    console.error('❌ GetAllCompanies error:', err.response?.data || err.message);
    return { data: { data: [] } };
  }
};

const GetAllUsers = async () => axiosClient.get('/users?populate=role');

const GetAllAdmins = async () => {
  try {
    const res = await axiosClient.get(
      '/users?filters[role][name][$eq]=admin&populate=role'
    );
    return res;
  } catch (err) {
    console.error('❌ GetAllAdmins error:', err.response?.data || err.message);
    return { data: { data: [] } };
  }
};

// Notifications
const GetAllNotifications = () => axiosClient.get('/notifications?populate=*');
const CreateNotification = (payload) => axiosClient.post('/notifications', payload);
const UpdateNotification = (id, data) => axiosClient.put(`/notifications/${id}`, data);
const DeleteNotification = (id) => axiosClient.delete(`/notifications/${id}`);
const GetNotificationById = (id) =>
  axiosClient.get(`/notifications/${id}?populate=participants,organizer`);

// CVs
const GetApprovedCVs = () =>
  axiosClient.get('/cvs?filters[isApproved][$eq]=true&populate=companyStatus');

const GetApprovedResumes = async () =>
  axiosClient.get('/user-resumes?filters[isApproved][$eq]=true&populate[notifications][populate]=organizer.role');

// CV (cvs)
const CreateNewCV = (data) => axiosClient.post('/cvs', { data });
const GetAllCVs = () => axiosClient.get('/cvs?populate=*');
const GetCVById = (id) => axiosClient.get(`/cvs/${id}?populate=*`);
const UpdateCV = (id, data) => axiosClient.put(`/cvs/${id}`, { data });
const DeleteCV = (id) => axiosClient.delete(`/cvs/${id}`);

const GetAllCVsByFilter = (params) =>
  axiosClient.get('/cvs', {
    params,
  });

const UpdateCompanyUserStatus = (companyId, status) =>
  axiosClient.put(`/users/${companyId}`, {
    companyStatus: status,
  });
//Company-announcement
const GetAllCompanyAnnouncements = () =>
  axiosClient.get('/company-announcements?populate=*');


const CreateCompanyAnnouncement = (data) =>
  axiosClient.post('/company-announcements', data);

const UpdateCompanyAnnouncement = (id, data) => {
  console.log("📤 API CALL TO STRAPI", id, data);
  return axiosClient.put(`/company-announcements/${id}`, data);
};


const DeleteCompanyAnnouncement = (id) =>
  axiosClient.delete(`/company-announcements/${id}`);

const GetCompanyAnnouncementById = (id) =>
  axiosClient.get(`/company-announcements/${id}?populate=*`);

const IncrementLike = (id, currentLikes) =>
  axiosClient.put(`/company-announcements/${id}`, {
    data: { like: currentLikes + 1 }
  });

const IncrementDislike = (id, currentDislikes) =>
  axiosClient.put(`/company-announcements/${id}`, {
    data: { dislike: currentDislikes + 1 }
  });



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
  GetUserResumeByResumeId,
  GetAllAdmins,
  GetApprovedResumes,
  CreateNewCV,
  GetAllCVs,
  GetCVById,
  UpdateCV,
  DeleteCV,
  GetAllCVsByFilter,
  UpdateCompanyUserStatus,
  GetAllCompanyAnnouncements,
  CreateCompanyAnnouncement,
  UpdateCompanyAnnouncement,
  DeleteCompanyAnnouncement,
  GetCompanyAnnouncementById,
  IncrementLike,
  IncrementDislike,

};
