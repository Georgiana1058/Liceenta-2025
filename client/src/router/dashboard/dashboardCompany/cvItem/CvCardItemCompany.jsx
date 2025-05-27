import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalAPI from '../../../../../service/GlobalAPI';

function CvCardItemCompany({ cv }) {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!cv.soucerResume) return;

      try {
        const res = await GlobalAPI.GetUserResumeByResumeId(cv.soucerResume);
        const data = res?.data?.data?.[0];
        setResumeData(data);
      } catch (err) {
        console.error("❌ Error fetching resume data for CV:", err);
      }
    };

    fetchResumeData();
  }, [cv.soucerResume]);

  const user = cv.user;
  const userName = resumeData?.firstName && resumeData?.lastName
    ? `${resumeData.firstName} ${resumeData.lastName}`
    : user?.username || resumeData?.userName || 'Unknown';

  const userEmail = user?.email || resumeData?.userEmail || 'No email';
  const photoUrl = resumeData?.photoUrl?.[0]?.url
    ? `http://localhost:1337${resumeData.photoUrl[0].url}`
    : '/default-user.png';


  return (
    <div className="relative group">
      <div
        onClick={() => navigate(`/view-company/${cv.id}`)}
        className="relative h-[300px] rounded-lg overflow-hidden border-2 hover:scale-105 transition-all shadow-md cursor-pointer"
        style={{ borderColor: '#14346b' }}
      >
        <img src={photoUrl} alt="User Photo" className="w-full h-full object-cover" />
      </div>

      <h2 className="text-center mt-2 font-semibold text-lg">{cv.title}</h2>
      <p className="text-center text-sm text-gray-600">
        {userName} ({userEmail})
      </p>
    </div>
  );
}

export default CvCardItemCompany;
