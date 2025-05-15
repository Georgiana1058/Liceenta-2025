"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar as BigCalendar, Views } from "react-big-calendar";
import localizer from "@/lib/localizer";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useUser } from "@clerk/clerk-react";
import { useStrapiUser } from "@/hooks/useStrapiUser";
import GlobalAPI from "../../../service/GlobalAPI";


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

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [approvedCVs, setApprovedCVs] = useState([]);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dataReady, setDataReady] = useState(false);
  const [allEvents, setAllEvents] = useState([]);

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
      organizer: item.organizer?.data ? {
        id: item.organizer.data.id,
        email: item.organizer.data.attributes?.email,
      } : null,

      // ✅ câmpuri noi:
      modificationRequest: item.modificationRequest || false,
      modificationContext: item.modificationContext || "",
      suggestedTimes: item.suggestedTimes || [],
    })) || [];
  };

  useEffect(() => {
    GlobalAPI.GetCalendarEvents().then((res) => {
      const mapped = mapEvents(res?.data?.data); // 👈 apelezi funcția corect
      setAllEvents(mapped);
    });
  }, []);



  useEffect(() => {
    if (!clerkEmail || !allEvents.length) return;

    console.log("📩 Clerk email pentru fallback filtrare:", clerkEmail);

   const fetchAndFilterEvents = async () => {
  try {
    const fullEvents = await Promise.all(
      allEvents.map(async (e) => {
        const res = await GlobalAPI.GetCalendarEventById(e.id);
        const data = res?.data?.data;

        const organizerEmail = data?.organizer?.email;
        const participantEmails = data?.participants?.map((p) => p.email) || [];

        const isOrganizer = organizerEmail === clerkEmail;
        const isParticipant = participantEmails.includes(clerkEmail);

        return isOrganizer || isParticipant
          ? mapEvents([data])[0] // 👈 aici e cheia
          : null;
      })
    );

    const filteredEvents = fullEvents.filter(Boolean);
    setEvents(filteredEvents);
    console.log("✅ Evenimente filtrate corect:", filteredEvents);
  } catch (err) {
    console.error("❌ Eroare la fallback fetch:", err);
  }
};


    fetchAndFilterEvents();
  }, [clerkEmail, allEvents]);




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


  const handleSave = async () => {
    const {
      id,
      title,
      description,
      start,
      end,
      location,
      meetingLink,
      isOnline,
      participantIds,
      type,
      statusEvent,
      cv,
    } = form;

    if (!title || !start || !end) {
      alert("⚠️ Please fill in title, start, and end date.");
      return;
    }

    if (new Date(start) >= new Date(end)) {
      alert("❌ End time must be after start time.");
      return;
    }
    console.log("🟡 id în form:", id, typeof id);
    console.log("📅 id-uri în events:", events.map(ev => `${ev.id} (${typeof ev.id})`));

    const isOverlap = events.some(
      (ev) =>
        new Date(start) < new Date(ev.end) &&
        new Date(end) > new Date(ev.start) &&
        !(ev.id == form.id)

    );


    if (isOverlap) {
      alert("❌ There's already an event at this time.");
      return;
    }

    const payload = {
      title,
      description,
      startTime: start,
      endTime: end,
      location,
      meetingLink,
      isOnline,
      statusEvent,
      type,
      organizer: strapiUser?.id || null,
      cv: cv ? parseInt(cv) : null,
      participants: participantIds.length ? participantIds : [strapiUser?.id],
      modificationRequest: form.modificationRequest,
      modificationContext: form.modificationContext,
      suggestedTimes: form.suggestedTimes,

    };

    try {
      if (id) {
        await GlobalAPI.UpdateCalendarEvent(id, { data: payload });
      } else {
        await GlobalAPI.CreateCalendarEvent({ data: payload });
      }




      const updated = await GlobalAPI.GetCalendarEvents();
      const mapped = mapEvents(updated?.data?.data);

      setAllEvents(mapped);
      setEvents(mapped.filter(e =>
        e.organizer?.email === clerkEmail ||
        e.participants?.some(p => p.email === clerkEmail)
      ));


      setOpenModal(false);
      setForm({
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
      });
    } catch (error) {
      console.error("❌ Error saving event:", error);
    }
  };


  return (
    <div>
      <Header />
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
          onSelectSlot={(slotInfo) => {
            setForm({
              id: null,
              title: "",
              description: "",
              start: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
              end: format(slotInfo.end, "yyyy-MM-dd'T'HH:mm"),
              location: "",
              meetingLink: "",
              isOnline: false,
              participantIds: [],
              type: "interview",
              statusEvent: "scheduled",
              cv: null,
            });
            setOpenModal(true);

          }}
          onSelectEvent={async (event) => {
            try {
              const res = await GlobalAPI.GetCalendarEventById(event.id);
              const data = res?.data?.data;

              const updatedForm = {
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

              };

              console.log("✅ Setting form with:", updatedForm);
              setForm(updatedForm);
              setTimeout(() => setOpenModal(true), 50);

            } catch (err) {
              console.error("❌ Failed to fetch event by ID:", err);
            }


            { console.log("✅ participantIds in form:", form.participantIds) }
            { console.log("✅ cv in form:", form.cv) }
          }}

          eventPropGetter={(event) => {
            console.log("🎨 verificăm event:", event); // te va ajuta să vezi modificările
          
            if (event.modificationRequest === true) {
              return {
                style: {
                  backgroundColor: "#dc2626",
                  color: "white",
                },
              };
            }
          
            return {
              style: {
                backgroundColor: "#1e3a8a",
                color: "white",
              },
            };
          }}
          



        />

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent
            key={form.id ?? "new"} // 👈 forțează rerender complet
            className="max-h-[90vh] overflow-y-auto"

          >


            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={form.modificationRequest}
                onCheckedChange={(v) => {
                  setForm((prev) => ({
                    ...prev,
                    modificationRequest: v,
                    // Dacă debifezi => goliți câmpurile
                    ...(v ? {} : { suggestedTimes: [], modificationContext: "" }),
                  }));
                }}
              />
              <Label>Request Modification</Label>
            </div>

            {form.modificationRequest && (
              <>
                <Textarea
                  placeholder="Context for modification request"
                  value={form.modificationContext}
                  onChange={(e) =>
                    setForm({ ...form, modificationContext: e.target.value })
                  }
                  className="mb-2"
                />

                <Label>Suggested Times (comma separated ISO)</Label>
                <Input
                  placeholder="14/4/2025-20:00;16/4/2025-21:00"
                  value={form.suggestedTimes.join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      suggestedTimes: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t),
                    })
                  }
                  className="mb-2"
                />
              </>
            )}


            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mb-2"
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="mb-2"
            />
            <Input
              type="datetime-local"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
              className="mb-2"
            />
            <Input
              type="datetime-local"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
              className="mb-2"
            />
            <Input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mb-2"
            />
            <Input
              placeholder="Meeting link"
              value={form.meetingLink}
              onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
              className="mb-2"
            />

            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={form.isOnline}
                onCheckedChange={(v) => setForm({ ...form, isOnline: v })}
              />
              <Label>Online Event</Label>
            </div>

            <MultiSelectCombobox
              key={form.participantIds.join("-")} // ✅ rerender dacă lista se schimbă
              options={users.map(u => ({ value: u.id, label: u.email }))}
              selectedValues={form.participantIds}
              onChange={(val) => setForm({ ...form, participantIds: val })}
            />

            <SingleSelectCombobox
              key={form.cv} // ✅ rerender dacă cv-ul se schimbă
              options={approvedCVs.map((cv) => ({
                value: cv.id,
                label: `${cv.title} - ${cv.user?.email || "unknown"}`
              }))}
              selectedValue={form.cv}
              onChange={(newValue) => setForm({ ...form, cv: newValue })}
            />


            <Label>Type</Label>
            <select
              className="w-full border p-2 rounded mb-2"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="interview">Interview</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>

            <Label>Status</Label>
            <select
              className="w-full border p-2 rounded mb-2"
              value={form.statusEvent}
              onChange={(e) =>
                setForm({ ...form, statusEvent: e.target.value })
              }
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>

            <div className="flex justify-between mt-4">
              <Button variant="ghost" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
            <div>
              {form.id && (
                <Button
                  className='bg-red-600 hover:bg-red-700 text-white'
                  onClick={async () => {
                    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
                    if (!confirmDelete) return;

                    try {
                      await GlobalAPI.DeleteCalendarEvent(form.id);

                      const updated = await GlobalAPI.GetCalendarEvents();
                      const mapped = mapEvents(updated?.data?.data);

                      setAllEvents(mapped);
                      setEvents(mapped.filter(e =>
                        e.organizer?.email === strapiUser?.email ||
                        e.participants?.some(p => p.email === strapiUser?.email)
                      ));

                      setOpenModal(false);
                      setForm({
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
                      });
                    } catch (error) {
                      console.error("❌ Error deleting event:", error);
                    }
                  }}
                >
                  Delete
                </Button>
              )}

            </div>

          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
