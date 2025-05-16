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

function Notifications() {
  const { user } = useUser();
  const { user: strapiUser } = useStrapiUser(user?.id);
  const [notifications, setNotifications] = useState([]);
  const hasGenerated = useRef(false); // ✅ persistent între rerenderuri

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  // 🔁 Funcție reutilizabilă pentru a încărca notificările
  const loadNotifications = async () => {
    try {
      const res = await GlobalAPI.GetAllNotifications();
      const allIds = res?.data?.data?.map((n) => n.id) || [];

      const fetched = await Promise.all(
        allIds.map(async (id) => {
          const res = await GlobalAPI.GetNotificationById(id);
          const data = res?.data?.data;
          return data?.participant?.email === userEmail ? data : null;
        })
      );

      setNotifications(fetched.filter(Boolean));
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
    if (!strapiUser?.email || hasGenerated.current) return;
  
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
  
  Based on this, suggest one course (Coursera/Udemy/etc.) to improve employability.
  ⚠️ Include the course link on a new line starting with: LINK:
  `;
  
          const result = await model.generateContent(prompt);
          const text = await result.response.text();
          const match = text.match(/LINK:\s*(https?:\/\/[^\s)]+)/i);
          link = match?.[1] ?? null;
          message = text.replace(/LINK:\s*https?:\/\/[^\s)]+/i, "").trim();
        }
  
        await GlobalAPI.CreateNotification({
          data: {
            title: "Sugestie AI pentru cursuri",
            message,
            type: "course_sugestion",
            isRead: false,
            participant: strapiUser.id,
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔔 My Notifications</h2>
      <div className="space-y-4">
        {notifications.length === 0 && (
          <p className="text-gray-500">You don't have any notifications right now.</p>
        )}

        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`border p-4 rounded-lg shadow-sm ${notif.isRead ? "bg-white" : "bg-blue-50"}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg mb-1">{notif.title}</h3>
                <p className="text-sm text-gray-800">{notif.message}</p>

                {notif.interviewDate && (
                  <p className="text-blue-700 text-sm mt-2 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Interview: {format(new Date(notif.interviewDate), "dd/MM/yyyy HH:mm")}
                  </p>
                )}

                {notif.responseReason && (
                  <p className="text-red-600 italic text-sm mt-2">
                    Rejection reason: {notif.responseReason}
                  </p>
                )}

                {notif.feedbackScore !== null && (
                  <p className="text-sm mt-2">
                    Feedback score: <strong>{notif.feedbackScore}/10</strong>
                  </p>
                )}

                {notif.linkedRecommendationURL && (
                  <a
                    href={notif.linkedRecommendationURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm mt-2 inline-block"
                  >
                    View recommended course
                  </a>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(notif.id)}>
                Mark as read
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
