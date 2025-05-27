import React, { useEffect, useState } from 'react';
import GlobalAPI from '../../../../service/GlobalAPI';
import CvCardItemCompany from '../dashboardCompany/cvItem/CvCardItemCompany';
import Header from '@/components/header-custom/Header';
import { useUser } from '@clerk/clerk-react';
import { useStrapiUser } from '@/hooks/useStrapiUser';

function DashboardCompany() {
  const [cvs, setCvs] = useState([]);
  const { user } = useUser();
  const { user: strapiUser } = useStrapiUser(user?.id);

  useEffect(() => {
    const fetchAndFilterCVs = async () => {
      try {
        console.log("📦 Fetching approved CVs...");
        const res = await GlobalAPI.GetApprovedCVs(); // trebuie să includă populate=companyStatus
        const allCVs = res?.data?.data || [];
        console.log("🔢 Total CVs fetched:", allCVs.length);

        if (!strapiUser?.id) {
          console.warn("❌ No Strapi user found.");
          return;
        }

        const filtered = allCVs.filter((cv) => {
          console.log("cv",cv);
          const companyStatus = cv?.companyStatus || [];
          console.log("companyStatus",companyStatus)
          const match = companyStatus.some(company => company?.id === strapiUser.id);
          if (!match) {
            console.log(`🚫 CV not matched: ${cv.id} | companyStatus:`, companyStatus);
          }
          return match;
        });

        console.log("✅ Filtered CVs:", filtered.length);
        setCvs(filtered);
      } catch (err) {
        console.error("❌ Error loading CVs:", err);
      }
    };

    if (strapiUser?.id) {
      fetchAndFilterCVs();
    }
  }, [strapiUser]);

  return (
    <div>
      <Header />
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-4">Available CVs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cvs.length > 0 ? (
            cvs.map((cv) => <CvCardItemCompany key={cv.id} cv={cv} />)
          ) : (
            <p className="col-span-full text-center text-gray-500">No CVs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardCompany;
