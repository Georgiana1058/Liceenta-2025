"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar as BigCalendar, Views } from "react-big-calendar";
import localizer from "@/lib/localizer";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useUser } from "@clerk/clerk-react";
import { useStrapiUser } from "@/hooks/useStrapiUser";
import GlobalAPI from "../../../service/GlobalAPI";
import EventForm from "./EventForm";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Header from "@/components/header-custom/Header";
import MultiSelectCombobox from "@/components/ui/MultiSelelctCombobox";
import SingleSelectCombobox from "@/components/ui/SingleSelectCombobox";
import { Plus } from "lucide-react";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [approvedCVs, setApprovedCVs] = useState([]);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dataReady, setDataReady] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterParticipant, setFilterParticipant] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");


  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    start: "",
    end: "",
    location: "",
    meetingLink: "",
    isOnline: false,
    participantIds: [],
    type: "interview",
    statusEvent: "scheduled",
    cv: null,
    modificationRequest: false,
    suggestedTimes: [],
    modificationContext: "",
  });

  const { user } = useUser();
  const { user: strapiUser, loading: userLoading } = useStrapiUser(user?.id);
  console.log("🧠 strapiUser din hook:", strapiUser);
  const clerkEmail = user?.emailAddresses?.[0]?.emailAddress;
  console.log("🧩 Clerk user:", user);
  // pasul 1: încarcă toate evenimentele, dar nu le filtrezi direct
  const refreshCalendar = async () => {
    try {
      const res = await GlobalAPI.GetCalendarEvents();
      const all = mapEvents(res?.data?.data);
      setAllEvents(all);

      // aplică filtrare imediat, fără întârziere
      const fullEvents = await Promise.all(
        all.map(async (e) => {
          const response = await GlobalAPI.GetCalendarEventById(e.id);
          const data = response?.data?.data;

          const organizerEmail = data?.organizer?.email;
          const participantEmails = data?.participants?.map(p => p.email) || [];

          const isOrganizer = organizerEmail === clerkEmail;
          const isParticipant = participantEmails.includes(clerkEmail);

          return isOrganizer || isParticipant ? mapEvents([data])[0] : null;
        })
      );

      const filtered = fullEvents.filter(Boolean);
      setEvents(filtered);
    } catch (err) {
      console.error("❌ Failed to refresh calendar:", err);
    }
  };


  const mapEvents = (data) => {
    return data?.map((item) => ({
      id: item.id,
      title: item.title,
      start: new Date(item.startTime),
      end: new Date(item.endTime),
      description: item.description,
      location: item.location,
      isOnline: item.isOnline,
      meetingLink: item.meetingLink,
      type: item.type,
      statusEvent: item.statusEvent,
      participants: item.participants?.data?.map(p => ({
        id: p.id,
        email: p.attributes?.email
      })) || [],
      cv: item.cv?.data || null,
      organizer: item.organizer ? {
        id: item.organizer.id,
        email: item.organizer.email,
      } : null,


      // ✅ câmpuri noi:
      modificationRequest: item.modificationRequest || false,
      modificationContext: item.modificationContext || "",
      suggestedTimes: item.suggestedTimes || [],
    })) || [];
  };

  useEffect(() => {
    if (clerkEmail) {
      refreshCalendar();
    }
  }, [clerkEmail]);

  useEffect(() => {
    Promise.all([
      GlobalAPI.GetAllUsers(),
      GlobalAPI.GetApprovedCVs()
    ])
      .then(([usersRes, cvsRes]) => {
        const usersList = usersRes?.data?.map((u) => ({
          id: u.id,
          email: u.email,
          username: u.username || u.email,
        })) || [];

        const cvsList = cvsRes?.data?.data ?? [];

        setUsers(usersList);
        setApprovedCVs(cvsList);
        setDataReady(true); // ✅ aici confirmi că totul e gata
      })
      .catch((err) => {
        console.error("❌ Error loading users or CVs:", err);
      });
  }, []);


  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .rbc-toolbar {
        margin-bottom: 1.5rem;
      }

      .rbc-toolbar button {
        background-color: #14346b !important;
        color: white !important;
        font-weight: 600 !important;
        border: none !important;
        padding: 0.5rem 1.25rem !important;
        border-radius: 0.375rem !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s ease !important;
        margin-right: 0.5rem;
        cursor: pointer !important;
      }

      .rbc-toolbar button:hover {
        background-color: #16887f !important;
        transform: scale(1.05);
      }

      .rbc-toolbar button.rbc-active {
        background-color: #16887f !important;
        color: white !important;
      }

      .rbc-toolbar-label {
        font-size: 1.875rem !important;
        font-weight: 700 !important;
        color: #1e3a8a !important;
      }

      .rbc-event {
        background-color: #1e3a8a;
        color: white !important;
        font-size: 0.875rem !important;
        padding: 2px 6px !important;
        border-radius: 0.375rem !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .rbc-today {
        background-color: #d1fae5 !important;
      }`
      ;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const filtered = allEvents
      .filter(e => e.organizer?.email === clerkEmail) // 🎯 doar dacă e organizator
      .filter(e => filterType === "all" || e.type === filterType)
      .filter(e => filterStatus === "all" || e.statusEvent === filterStatus)
      
      .filter(e => {
        if (!filterSearch) return true;
        const lower = filterSearch.toLowerCase();
        return e.title.toLowerCase().includes(lower) || e.description.toLowerCase().includes(lower);
      })
      .filter(e => {
        if (!filterDate) return true;
        const eventDate = format(new Date(e.start), "yyyy-MM-dd");
        return eventDate === filterDate;
      });

    setEvents(filtered);
  }, [filterType, filterStatus, filterParticipant, filterSearch, filterDate, allEvents, clerkEmail]);


  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formAdd, setFormAdd] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    location: "",
    meetingLink: "",
    isOnline: false,
    participantIds: [],
    type: "interview",
    statusEvent: "scheduled",
    cv: null,
    modificationRequest: false,
    suggestedTimes: [],
    modificationContext: "",
  });
  const [formEdit, setFormEdit] = useState({ ...formAdd, id: null });

  const handleAddEvent = async () => {
    if (!formAdd.title || !formAdd.start || !formAdd.end) {
      alert("⚠️ Please fill in all required fields.");
      return;
    }

    try {
      await GlobalAPI.CreateCalendarEvent({
        data: {
          title: formAdd.title,
          description: formAdd.description,
          startTime: formAdd.start,
          endTime: formAdd.end,
          location: formAdd.location,
          meetingLink: formAdd.meetingLink,
          isOnline: formAdd.isOnline,
          type: formAdd.type,
          statusEvent: formAdd.statusEvent,
          modificationRequest: formAdd.modificationRequest,
          suggestedTimes: formAdd.suggestedTimes,
          modificationContext: formAdd.modificationContext,
          organizer: strapiUser?.id,
          cv: formAdd.cv ? parseInt(formAdd.cv) : null,
          participants: formAdd.participantIds.length
            ? formAdd.participantIds.map((id) => parseInt(id))
            : [strapiUser?.id],
        },
      });
      await refreshCalendar();
      setOpenAddModal(false);
      setFormAdd({ ...formAdd, title: "", description: "", start: "", end: "", location: "" });
    } catch (err) {
      console.error("❌ Error adding event:", err);
    }
  };

  const handleEditEvent = async () => {
    if (!formEdit.id || !formEdit.title || !formEdit.start || !formEdit.end) {
      alert("⚠️ Please fill in all required fields.");
      return;
    }

    try {
      await GlobalAPI.UpdateCalendarEvent(formEdit.id, {
        data: {
          ...formEdit,
          startTime: formEdit.start,
          endTime: formEdit.end,
          organizer: strapiUser?.id,
          cv: formEdit.cv ? parseInt(formEdit.cv) : null,
          participants: formEdit.participantIds.length ? formEdit.participantIds : [strapiUser?.id],
        },
      });
      await refreshCalendar();
      setOpenEditModal(false);
    } catch (err) {
      console.error("❌ Error updating event:", err);
    }
  };


  const emptyForm = () => ({
    title: "",
    description: "",
    start: "",
    end: "",
    location: "",
    meetingLink: "",
    isOnline: false,
    participantIds: [],
    type: "interview",
    statusEvent: "scheduled",
    cv: null,
    modificationRequest: false,
    suggestedTimes: [],
    modificationContext: "",
  });

  return (
    <div>
      <Header />

      <div className="flex flex-wrap gap-4 mb-4">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border p-2 rounded">
          <option value="all">All Types</option>
          <option value="interview">Interview</option>
          <option value="meeting">Meeting</option>
          <option value="other">Other</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-2 rounded">
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </select>

        <Input
          type="text"
          placeholder="Search title/description"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border p-2 rounded"
        />

      </div>

      <div className="flex flex-col min-h-screen p-4">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={currentView}
          onView={(view) => setCurrentView(view)}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          defaultView={Views.MONTH}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          style={{ height: "75vh" }}
          selectable
          eventPropGetter={(event) => {
            if (event.modificationRequest) {
              return {
                style: {
                  backgroundColor: "#dc2626", // roșu intens
                  color: "white",
                  fontWeight: "bold",
                },
              };
            }
            return {}; // default style
          }}
          onSelectSlot={(slotInfo) => {
            setFormAdd({
              ...emptyForm(),
              start: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
              end: format(slotInfo.end, "yyyy-MM-dd'T'HH:mm"),
            });
            setOpenAddModal(true);
          }}
          onSelectEvent={async (event) => {
            try {
              const res = await GlobalAPI.GetCalendarEventById(event.id);
              const data = res?.data?.data;

              setFormEdit({
                id: data.id,
                title: data.title || "",
                description: data.description || "",
                start: format(new Date(data.startTime), "yyyy-MM-dd'T'HH:mm"),
                end: format(new Date(data.endTime), "yyyy-MM-dd'T'HH:mm"),
                location: data.location || "",
                meetingLink: data.meetingLink || "",
                isOnline: data.isOnline || false,
                participantIds: data.participants?.map(p => p.id) || [],
                type: data.type || "interview",
                statusEvent: data.statusEvent || "scheduled",
                cv: data.cv?.id || null,
                modificationRequest: data?.modificationRequest || false,
                modificationContext: data?.modificationContext || "",
                suggestedTimes: data?.suggestedTimes || [],
              });

              setOpenEditModal(true);
            } catch (err) {
              console.error("❌ Failed to fetch event by ID:", err);
            }
          }}
        />

        {/* Buton flotant pentru adăugare eveniment */}
        <Button
          onClick={() => {
            setFormAdd(emptyForm());
            setOpenAddModal(true);
          }}
          className="fixed bottom-6 left-6 bg-[#14346b] text-white hover:bg-[#16887f] font-semibold rounded-full w-14 h-14 shadow-md flex items-center justify-center transition duration-300"
          title="Adaugă eveniment"
        >
          <Plus className="w-6 h-6" />
        </Button>


        {/* Dialoguri separate pentru Adăugare și Editare */}
        <DialogAdd
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          form={formAdd}
          setForm={setFormAdd}
          onSave={handleAddEvent}
          users={users}
          cvs={approvedCVs}
        />

        <DialogEdit
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          form={formEdit}
          setForm={setFormEdit}
          onSave={handleEditEvent}
          users={users}
          cvs={approvedCVs}
          setAllEvents={setAllEvents}
          refreshCalendar={refreshCalendar}
          setEvents={setEvents}
          setOpenEditModal={setOpenEditModal}
        />


      </div>
    </div>
  );

}
function DialogAdd({ open, onClose, form, setForm, onSave, users, cvs }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <EventForm form={form} setForm={setForm} users={users} cvs={cvs} onSave={onSave} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

function DialogEdit({ open, onClose, form, setForm, onSave, users, cvs, setAllEvents, setEvents, setOpenEditModal, refreshCalendar }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <EventForm
          form={form}
          setForm={setForm}
          users={users}
          cvs={cvs}
          onSave={onSave}
          onClose={onClose}
          setAllEvents={setAllEvents}
          setEvents={setEvents}
          setOpenEditModal={setOpenEditModal}
          refreshCalendar={refreshCalendar} // ✅ AICI!
        />

      </DialogContent>
    </Dialog>
  );
}


