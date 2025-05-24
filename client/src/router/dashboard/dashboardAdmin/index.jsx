import React, { useEffect, useState } from 'react';
import GlobalAPI from '../../../../service/GlobalAPI';
import ResumeCardItemAdmin from '../dashboardAdmin/resumeItem/ResumeCardItemAdmin';
import Header from '@/components/header-custom/Header';
import { Input } from '../../../components/ui/input';

function DashboardAdmin() {
  const [approvedResumes, setApprovedResumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name | title | email
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc

  useEffect(() => {
    GetApprovedResumes();
  }, []);

  const GetApprovedResumes = () => {
    GlobalAPI.GetApprovedResumes()
      .then((resp) => {
        setApprovedResumes(resp.data.data || []);
      })
      .catch((err) => {
        console.error('❌ Error fetching approved resumes', err);
      });
  };

  // 🔍 Filtrare locală
  const filteredResumes = approvedResumes.filter((resume) => {
    const fullName = `${resume.firstName || ''} ${resume.lastName || ''}`.toLowerCase();
    return (
      resume.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase())
    );
  });

  // 🔃 Sortare locală
  const sortResumes = (resumes) => {
    return [...resumes].sort((a, b) => {
      let valA = '', valB = '';

      if (sortBy === 'name') {
        valA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
        valB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
      } else if (sortBy === 'title') {
        valA = a.title?.toLowerCase() || '';
        valB = b.title?.toLowerCase() || '';
      } else if (sortBy === 'email') {
        valA = a.email?.toLowerCase() || '';
        valB = b.email?.toLowerCase() || '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedResumes = sortResumes(filteredResumes);

  return (
    <div>
      <Header />
      <div className="p-10 md:px-20 lg:px-32">
        <h2 className="font-bold text-3xl mb-2">Resumes Waiting for Admin Review</h2>
        <p className="text-gray-500 mb-6">Filter by student name, email, or resume title.</p>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
          <Input
            type="text"
            placeholder="Search resumes..."
            className="max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="name">Sort by Name</option>
            <option value="title">Sort by Title</option>
            <option value="email">Sort by Email</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:grid-cols-5">
          {sortedResumes.length > 0 ? (
            sortedResumes.map((resume, index) => (
              <ResumeCardItemAdmin key={index} resume={resume} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-400">No resumes found for your filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;

