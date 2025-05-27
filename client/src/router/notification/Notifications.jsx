"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useStrapiUser } from "@/hooks/useStrapiUser";
import GlobalAPI from "../../../service/GlobalAPI";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import model from "../../../service/AIModal";
import { useRef } from "react";
import FeedbackStars from "../notification/FeedbackStar/FeedbackStar";
import { toast } from "sonner";
import Header from "@/components/header-custom/Header";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function Notifications() {
  const { user } = useUser();
  const { user: strapiUser } = useStrapiUser(user?.id);
  const [notifications, setNotifications] = useState([]);
  const hasGenerated = useRef(false); // ✅ persistent între rerenderur
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const [feedbackScores, setFeedbackScores] = useState({});
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openResponseDialog, setOpenResponseDialog] = useState(false);
  const [currentInterviewNotif, setCurrentInterviewNotif] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [newInterviewDate, setNewInterviewDate] = useState("");
  const [responseMode, setResponseMode] = useState("accept");



  const handleSubmitScore = async (notifId) => {
    const score = feedbackScores[notifId];
    if (!score) return toast.error("Select a score first.");

    try {
      await GlobalAPI.UpdateNotification(notifId, {
        data: { feedbackScore: score },
      });
      toast.success("✅ Score saved!");
      setFeedbackScores((prev) => ({ ...prev, [notifId]: undefined }));
      loadNotifications(); // reîncarcă lista
    } catch (err) {
      console.error("❌ Failed to submit score:", err);
      toast.error("Failed to save score.");
    }
  };

  // 🔁 Funcție reutilizabilă pentru a încărca notificările
  const loadNotifications = async () => {
    if (!userEmail) return;

    try {
      const res = await GlobalAPI.GetAllNotifications(); // get all, cu populate complet
      const all = res?.data?.data || [];

      const filtered = all.filter((notif) => {
        const isParticipant = notif?.participants?.some(p => p?.email === userEmail);
        const isOrganizer = notif?.organizer?.email === userEmail;
        return isParticipant || isOrganizer;
      });

      setNotifications(filtered);
    } catch (err) {
      console.error("❌ Error loading notifications:", err);
    }
  };


  // 🔹 Inițial, încarcă notificările
  useEffect(() => {
    if (userEmail) loadNotifications();
  }, [userEmail]);

  // 🔹 Creează automat o sugestie AI la fiecare accesare
  useEffect(() => {
    if (
      !strapiUser?.email ||
      strapiUser?.role?.name !== "user" || // ✅ verificare rol
      hasGenerated.current
    ) return;

    const generateCourseSuggestion = async () => {
      hasGenerated.current = true; // ✅ marcat ca generat o singură dată

      try {
        console.log("📡 Generăm sugestie AI pentru:", strapiUser.email);
        const resumes = await GlobalAPI.GetUserResumesRaw(strapiUser.email);

        let message = "";
        let link = "";

        if (!resumes.length) {
          const result = await model.generateContent(
            `Give a short, friendly tip for a student making their first CV. Recommend one beginner-friendly online course.\n\nLINK: https://example.com/course`
          );
          const text = await result.response.text();
          const match = text.match(/LINK:\s*(https?:\/\/[^\s)]+)/i);
          link = match?.[1] ?? null;
          message = text.replace(/LINK:\s*https?:\/\/[^\s)]+/i, "").trim();
        } else {
          const cv = resumes[0];
          const allSkills = cv.skills || [];
          const allLangs = cv.languages || [];
          const allCerts = cv.certificates || [];

          const skillText = allSkills.map(s => `${s.name} (${s.rating}/10)`).join(", ");
          const langText = allLangs.map(l => `${l.languageName} (${l.proficiencyLevel})`).join(", ");
          const certText = allCerts.map(c => `${c.title} - ${c.issuer}`).join(", ");

          const prompt = `
  CV Overview:
  - Skills: ${skillText}
  - Languages: ${langText}
  - Certificates: ${certText}
  
  Based on this, suggest one course (Coursera/Udemy/freeCodeCamp/The Odin Project/CS50, W3Schools/YouTubeetc) to improve employability.
  ⚠️ Include the course link on a new line starting with: LINK:
  `;

          const result = await model.generateContent(prompt);
          const text = await result.response.text();
          const match = text.match(/LINK:\s*(https?:\/\/[^\s)]+)/i);
          link = match?.[1] ?? null;
          message = text.replace(/LINK:\s*https?:\/\/[^\s)]+/i, "").trim();
        }

        // 🔍 Verificăm dacă există deja o sugestie similară pentru utilizator
        const allNotifications = await GlobalAPI.GetAllNotifications();
        const alreadyExistsSimilar = allNotifications?.data?.data?.some((n) => {
          return (
            n?.type === "course_sugestion" &&
            n?.participant?.email === strapiUser.email &&
            n?.linkedRecommendationURL === link &&
            n?.message?.trim()?.toLowerCase() === message?.trim()?.toLowerCase()
          );
        });

        if (alreadyExistsSimilar) {
          console.log("⏭️ Sugestia AI este deja salvată (aceeași recomandare). Nu o mai adăugăm.");
          return;
        }

        await GlobalAPI.CreateNotification({
          data: {
            title: "Sugestie AI pentru cursuri",
            message,
            type: "course_sugestion",
            isRead: false,
            participants: [strapiUser.id],
            linkedRecommendationURL: link || "https://www.udemy.com",
          },
        });

        console.log("✅ Notificare AI salvată!");
      } catch (err) {
        console.error("❌ Eroare generare sugestie AI:", err);
      }
    };

    generateCourseSuggestion();
  }, [strapiUser]);


  // 🗑️ Șterge notificarea din Strapi și din front-end
  const handleMarkAsRead = async (notifId) => {
    try {
      await GlobalAPI.DeleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (err) {
      console.error("❌ Error deleting notification:", err);
    }
  };
  const filteredNotifications = notifications.filter((n) => {
    const matchType = selectedType === "all" || n.type === selectedType;
    const matchSearch = searchTerm.trim() === "" || (
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchType && matchSearch;
  });



  return (
    <div>
      <div> <Header />
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Types</option>
          <option value="course_sugestion">Course Suggestions</option>
          <option value="feedback_positive">Positive Feedback</option>
          <option value="feedback_negative">Negative Feedback</option>
          <option value="interview_invite">Interview Invite</option>
        </select>

        <input
          type="text"
          placeholder="Search title or message..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        />

      </div>


      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">🔔 My Notifications</h2>
        <div className="space-y-4">
          {notifications.length === 0 && (
            <p className="text-gray-500">You don't have any notifications right now.</p>
          )}
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="border rounded-xl shadow-md bg-white p-5 flex flex-col gap-2 transition hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold text-[#14346b]">{notif.title}</h3>
                  <p className="text-sm text-gray-700">{notif.message}</p>

                  {notif.interviewDate && (
                    <p className="text-blue-700 text-sm mt-1 flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      Interview: {format(new Date(notif.interviewDate), "dd/MM/yyyy HH:mm")}
                    </p>
                  )}

                  {notif.responseReason && notif.type === 'feedback_negative' && (
                    <p className="text-red-600 italic text-sm">Rejection reason: {notif.responseReason}</p>
                  )}

                  {notif.responseReason && notif.type === 'feedback_positive' && (
                    <p className="text-green-600 italic text-sm">Feedback: {notif.responseReason}</p>
                  )}

                  {notif.type === "interview_response" && notif.responseReason && (
                    <p className="text-blue-800 italic text-sm">Response: {notif.responseReason}</p>
                  )}

                  {notif.linkedRecommendationURL && (
                    <a
                      href={notif.linkedRecommendationURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm inline-block"
                    >
                      View recommended course
                    </a>
                  )}

                  {notif.feedbackScore != null ? (
                    <p className="text-sm font-medium">
                      Feedback score: <span className="text-[#14346b]">{notif.feedbackScore}/5</span>
                    </p>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                      <FeedbackStars
                        value={feedbackScores[notif.id] || 0}
                        onChange={(val) =>
                          setFeedbackScores((prev) => ({ ...prev, [notif.id]: val }))
                        }
                      />
                      <Button
                        onClick={() => handleSubmitScore(notif.id)}
                        className="bg-[#14346b] hover:bg-[#16887f] text-white rounded-md px-4 py-1 text-sm"
                      >
                        Submit
                      </Button>
                    </div>
                  )}
                  {(notif.type === "interview_offer" || notif.type === "interview_response") && (
                    <Button
                      onClick={() => {
                        setCurrentInterviewNotif(notif);
                        setResponseMessage(notif.responseReason || "");
                        setNewInterviewDate(notif.interviewDate || "");
                        setResponseMode("accept"); // default e accept
                        setOpenResponseDialog(true);

                      }}
                      className="text-white rounded-md px-3 py-1 text-sm"
                    >
                      Respond to Interview
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="text-sm border-gray-300 hover:bg-gray-100"
                >
                  Mark as read
                </Button>
              </div>
            </div>
          ))}

        </div>
        <Dialog open={openResponseDialog} onOpenChange={setOpenResponseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{responseMode === "accept" ? "Accept Interview" : "Refuse Interview"}</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder="Write your message (why you accept/refuse or availability)..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
            />
            {responseMode === "accept" && (
              <Input
                type="datetime-local"
                value={newInterviewDate || ""}
                onChange={(e) => setNewInterviewDate(e.target.value)}
                className="mt-2"
              />
            )}

            <div className="flex justify-end gap-2 mt-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={responseMode === "accept" ? "default" : "outline"}
                  onClick={() => setResponseMode("accept")}
                >
                  Accept
                </Button>
                <Button
                  variant={responseMode === "refuse" ? "default" : "outline"}
                  onClick={() => {
                    setResponseMode("refuse");
                    setNewInterviewDate(""); // ștergem data dacă refuză
                  }}
                >
                  Refuse
                </Button>
              </div>

              <Button variant="outline" onClick={() => setOpenResponseDialog(false)}>Cancel</Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={async () => {
                  if (!responseMessage.trim()) return toast.error("You must write a message.");

                  try {
                    const oldOrganizerId = currentInterviewNotif.organizer?.id;
                    const otherParticipants = currentInterviewNotif.participants
                      ?.filter((p) => p?.id !== strapiUser.id && p?.id !== oldOrganizerId)
                      ?.map((p) => p.id) || [];

                    const updatedParticipants = [
                      ...(oldOrganizerId ? [oldOrganizerId] : []),
                      ...otherParticipants,
                    ];

                    await GlobalAPI.UpdateNotification(currentInterviewNotif.id, {
                      data: {
                        type: "interview_response",
                        title: "Interview Response",
                        responseReason: responseMessage,
                        interviewDate: newInterviewDate || null,
                        organizer: strapiUser.id,
                        participants: updatedParticipants.map((id) => ({ id })),
                      },
                    });

                    toast.success("✅ Response sent!");
                    setOpenResponseDialog(false);
                    loadNotifications();
                  } catch (err) {
                    console.error("❌ Error updating interview response:", err);
                    toast.error("Failed to send response.");
                  }
                }}
              >
                Send Response
              </Button>

            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

  );
}

export default Notifications;
