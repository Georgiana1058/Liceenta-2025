import React, { useEffect, useState } from 'react';
import Header from '@/components/header-custom/Header';
import GlobalAPI from '../../../service/GlobalAPI';
import { useUser } from '@clerk/clerk-react';
import { useStrapiUser } from '@/hooks/useStrapiUser';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const { user } = useUser();
  const { user: strapiUser } = useStrapiUser(user?.id);
  const [openDialog, setOpenDialog] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    jobTitle: '',
    jobDescription: '',
    jobType: '',
    applicationDeadline: '',
    expiryDate: '',
    requirements: '',
    benefits: '',
    isOpen: true,
    isActive: true,
    nameCompany: '',
    photoCompany: null,
    locations: [{ address: '', city: '', country: '', lat: 0, lng: 0 }],
  });

  useEffect(() => {
    console.log('📦 Component mounted. Fetching announcements...');
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await GlobalAPI.GetAllCompanyAnnouncements();
      console.log('📥 Raw response from Strapi:', res?.data?.data);

      const enriched = (res?.data?.data || []).map((a) => ({
        ...a,
        like: typeof a.likedByUsers === 'string'
          ? a.likedByUsers.split(',').filter(id => id.trim() !== '').length
          : 0,
        dislike: typeof a.dislikedByUsers === 'string'
          ? a.dislikedByUsers.split(',').filter(id => id.trim() !== '').length
          : 0,

      }));

      console.log('✅ Processed announcements:', enriched);
      setAnnouncements(enriched);
    } catch (err) {
      console.error('❌ Error loading announcements:', err);
    }
  };

  const handleLike = async (a) => {
    if (!strapiUser?.id) return;

    const userId = strapiUser.id;
    const likedStr = typeof a.likedByUsers === 'string' ? a.likedByUsers : "";

    // Parsează corect stringul în array de numere
    const likedIds = likedStr
      .split(',')
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    const hasLiked = likedIds.includes(userId);
    const updatedIds = hasLiked
      ? likedIds.filter((id) => id !== userId)
      : [...likedIds, userId];

    const updatedString = updatedIds.join(',');
    console.log(updatedIds.length);

    console.log("📌 updatedIds:", updatedIds);
    console.log("📤 Saving likedByUsers:", updatedString);

    const payload = {
      data: {
        likedByUsers: updatedString,
        like: updatedIds.length, // număr calculat local, corect
      },
    };

    try {
      const res = await GlobalAPI.UpdateCompanyAnnouncement(a.id, payload);
      console.log("✅ LIKE updated:", res.data);
      fetchAnnouncements(); // actualizează lista local
    } catch (err) {
      console.error("❌ LIKE error:", err.response?.data || err);
    }
  };




  const handleDislike = async (a) => {
    if (!strapiUser?.id) return;

    const userId = strapiUser.id;
    const dislikedStr = typeof a.dislikedByUsers === 'string' ? a.dislikedByUsers : "";
    const dislikedIds = dislikedStr
      .split(',')
      .map(id => parseInt(id)).filter(id => !isNaN(id));

    const hasDisliked = dislikedIds.includes(userId);
    const updatedIds = hasDisliked
      ? dislikedIds.filter(id => id !== userId)
      : [...dislikedIds, userId];

    const updatedString = updatedIds.join(',');
    const payload = {
      data: {
        dislikedByUsers: updatedString,
        dislike: updatedIds.length,
      },
    };

    console.log("📤 Saving string dislikedByUsers:", updatedString);

    try {
      const res = await GlobalAPI.UpdateCompanyAnnouncement(a.id, payload);
      console.log("✅ DISLIKE updated:", res.data);
      fetchAnnouncements();
    } catch (err) {
      console.error("❌ DISLIKE error:", err.response?.data || err);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      let photoId = null;

      if (newAnnouncement.photoCompany) {
        const formData = new FormData();
        formData.append('files', newAnnouncement.photoCompany);
        const uploadRes = await GlobalAPI.UploadFile(formData);
        photoId = uploadRes?.data?.[0]?.id;
      }

      const payload = {
        data: {
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          jobTitle: newAnnouncement.jobTitle,
          jobDescription: newAnnouncement.jobDescription,
          jobType: newAnnouncement.jobType,
          applicationDeadline: newAnnouncement.applicationDeadline + 'T23:59:00',
          expiryDate: newAnnouncement.expiryDate + 'T23:59:00',
          requirements: newAnnouncement.requirements,
          benefits: newAnnouncement.benefits,
          isOpen: true,
          isActive: true,
          nameCompany: newAnnouncement.nameCompany,
          user: String(strapiUser?.id),
          locations: newAnnouncement.locations.map(loc => ({
            address: loc.address || '',
            city: loc.city || '',
            country: loc.country || '',
            lat: loc.lat || 0,
            lng: loc.lng || 0,
          })),
          ...(photoId ? { photoCompany: photoId } : {}), // doar dacă s-a încărcat
        },
      };

      if (newAnnouncement.id) {
        await GlobalAPI.UpdateCompanyAnnouncement(newAnnouncement.id, payload);
      } else {
        await GlobalAPI.CreateCompanyAnnouncement(payload);
      }

      toast.success("✅ Announcement saved!");
      setOpenDialog(false);
      fetchAnnouncements();

      setNewAnnouncement({
        title: '',
        content: '',
        jobTitle: '',
        jobDescription: '',
        jobType: '',
        applicationDeadline: '',
        expiryDate: '',
        requirements: '',
        benefits: '',
        isOpen: true,
        isActive: true,
        nameCompany: '',
        photoCompany: null,
        locations: [{ address: '', city: '', country: '', lat: 0, lng: 0 }],
      });
      setPhotoPreview(null);
    } catch (err) {
      console.error("❌ Error creating/updating announcement:", err);
      toast.error("Error saving announcement.");
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!newAnnouncement.id) return;

    try {
      await GlobalAPI.DeleteCompanyAnnouncement(newAnnouncement.id);
      toast.success("✅ Announcement deleted!");
      setOpenDialog(false);
      fetchAnnouncements();
    } catch (err) {
      console.error("❌ Error deleting announcement:", err);
      toast.error("Error deleting announcement.");
    }
  };


  return (
    <div className="relative w-screen min-h-screen overflow-auto bg-white">
      <div className="relative h-[60vh]">
        <img src="/image.png" alt="Fundal Home" className="absolute w-full h-full object-cover z-0" />
        <div className="relative z-10"><Header /></div>
      </div>

      <div className="relative z-20 bg-white px-8 py-10">
        <h2 className="text-3xl font-bold text-[#14346b] mb-6">Latest Job Announcements</h2>
        {strapiUser?.role?.name === 'company' && (
          <Button onClick={() => setOpenDialog(true)} className="mb-6 bg-[#14346b] text-white hover:bg-[#1c4e8a]">
            ➕ Create New Announcement
          </Button>
        )}

        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-6 w-full">
            {announcements.map((a) => {
              const isAuthor = String(a.user) === String(strapiUser?.id);
              const img = Array.isArray(a.photoCompany) ? a.photoCompany[0] : a.photoCompany?.data?.attributes;

              return (
                <div
                  key={a.id}
                  onClick={() => {
                    if (!isAuthor) return;
                    setNewAnnouncement({
                      id: a.id,
                      title: a.title,
                      content: a.content,
                      jobTitle: a.jobTitle,
                      jobDescription: a.jobDescription,
                      jobType: a.jobType,
                      applicationDeadline: a.applicationDeadline?.split('T')[0],
                      expiryDate: a.expiryDate?.split('T')[0],
                      requirements: a.requirements,
                      benefits: a.benefits,
                      isOpen: a.isOpen,
                      isActive: a.isActive,
                      nameCompany: a.nameCompany,
                      photoCompany: null,
                      existingPhotoName: img?.name || '',
                      locations: a.locations?.length ? a.locations : [{ address: '', city: '', country: '', lat: 0, lng: 0 }],
                    });
                    const imgUrl = img?.url ? `http://localhost:1337${img.url}` : null;
                    setPhotoPreview(imgUrl);
                    setOpenDialog(true);
                  }}
                  className={`w-full bg-white rounded-xl shadow-md border p-6 hover:shadow-lg transition-all ${isAuthor ? 'cursor-pointer' : ''
                    }`}
                >
                  {img?.url && (
                    <img
                      src={`http://localhost:1337${img.url}`}
                      alt="Company"
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}

                  <h3 className="text-2xl font-bold text-[#14346b] mb-1">{a.jobTitle}</h3>
                  <p className="text-gray-700 mb-2">{a.jobDescription}</p>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Company:</strong> {a.nameCompany || 'N/A'}</p>
                    <p><strong>Type:</strong> {a.jobType}</p>
                    <p><strong>City:</strong> {a.locations?.[0]?.city || 'Unknown'}</p>
                    <p><strong>Country:</strong> {a.locations?.[0]?.country || 'Unknown'}</p>
                    <p><strong>Address:</strong> {a.locations?.[0]?.address || 'N/A'}</p>
                    <p><strong>📅 Deadline:</strong> {a.applicationDeadline?.split('T')[0]}</p>
                    <p><strong>Requirements:</strong> {a.requirements || '—'}</p>
                    <p><strong>Benefits:</strong> {a.benefits || '—'}</p>
                    <p className="text-xs text-gray-400">
                      Posted by: {isAuthor ? strapiUser?.email : a.users_permissions_user?.email || 'Unknown'}
                    </p>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(a);
                      }}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm"
                    >
                      👍 Like ({a.like || 0})
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDislike(a);
                      }}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm"
                    >
                      👎 Dislike ({a.dislike || 0})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>





        </div>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
          </DialogHeader>

          {/* Scroll activ pe conținut */}
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-3">

            <Input
              placeholder="Title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            />

            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-32 object-cover rounded-md mb-2"
              />
            )}

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setNewAnnouncement({ ...newAnnouncement, photoCompany: file });

                // actualizează preview local
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setPhotoPreview(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {!newAnnouncement.photoCompany && photoPreview && (
              <p className="text-sm text-gray-500">
                Fișier existent: {photoPreview.split('/').pop()}
              </p>
            )}

            {newAnnouncement.photoCompany && (
              <p className="text-sm text-gray-500">
                Fișier selectat: {newAnnouncement.photoCompany.name}
              </p>
            )}



            <Textarea
              placeholder="Content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
            />

            <Input
              placeholder="Job Title"
              value={newAnnouncement.jobTitle}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, jobTitle: e.target.value })}
            />
            <Input
              placeholder="Job Description"
              value={newAnnouncement.jobDescription}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, jobDescription: e.target.value })}
            />
            <Input
              placeholder="Job Type"
              value={newAnnouncement.jobType}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, jobType: e.target.value })}
            />
            <Input
              placeholder="Application Deadline"
              type="date"
              value={newAnnouncement.applicationDeadline}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, applicationDeadline: e.target.value })}
            />
            <Input
              placeholder="Expiry Date"
              type="date"
              value={newAnnouncement.expiryDate}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, expiryDate: e.target.value })
              }
            />

            <Textarea
              placeholder="Requirements"
              value={newAnnouncement.requirements}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, requirements: e.target.value })
              }
            />

            <Textarea
              placeholder="Benefits"
              value={newAnnouncement.benefits}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, benefits: e.target.value })
              }
            />

            <Input
              placeholder="Company Name"
              value={newAnnouncement.nameCompany}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, nameCompany: e.target.value })
              }
            />

            {/* Location fields */}
            <Input
              placeholder="Address"
              value={newAnnouncement.locations[0].address}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  locations: [{ ...newAnnouncement.locations[0], address: e.target.value }],
                })
              }
            />
            <Input
              placeholder="City"
              value={newAnnouncement.locations[0].city}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  locations: [{ ...newAnnouncement.locations[0], city: e.target.value }],
                })
              }
            />
            <Input
              placeholder="Country"
              value={newAnnouncement.locations[0].country}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  locations: [{ ...newAnnouncement.locations[0], country: e.target.value }],
                })
              }
            />
            <Input
              placeholder="Latitude"
              type="number"
              value={newAnnouncement.locations[0].lat}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  locations: [{ ...newAnnouncement.locations[0], lat: parseFloat(e.target.value) }],
                })
              }
            />
            <Input
              placeholder="Longitude"
              type="number"
              value={newAnnouncement.locations[0].lng}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  locations: [{ ...newAnnouncement.locations[0], lng: parseFloat(e.target.value) }],
                })
              }
            />
          </div>

          {/* Butoane de acțiune */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAnnouncement} className="bg-[#14346b] text-white hover:bg-[#1c4e8a]">
              Create
            </Button>
          </div>
          {newAnnouncement.id && (
            <Button
              onClick={handleDeleteAnnouncement}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              🗑️ Delete Announcement
            </Button>
          )}

        </DialogContent>
      </Dialog>

    </div>
  );
}

export default Home;
