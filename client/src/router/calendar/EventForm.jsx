import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import MultiSelectCombobox from "@/components/ui/MultiSelelctCombobox";
import SingleSelectCombobox from "@/components/ui/SingleSelectCombobox";
import GlobalAPI from "../../../service/GlobalAPI";

const emptyForm = () => ({
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

function EventForm({ form, setForm, users, cvs, onSave, onClose, refreshCalendar, setOpenEditModal }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Checkbox
                    checked={form.modificationRequest}
                    onCheckedChange={(v) => {
                        setForm((prev) => ({
                            ...prev,
                            modificationRequest: v,
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
                        value={form.modificationContext || ""}
                        onChange={(e) => setForm({ ...form, modificationContext: e.target.value })}
                        className="mb-2"
                    />
                    <Label>Suggested Times (comma separated)</Label>
                    <Input
                        placeholder="14/4/2025-20:00, 16/4/2025-21:00"
                        value={(form.suggestedTimes || []).join(", ")}
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
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                key={(form.participantIds || []).join("-")}
                options={users.map((u) => ({ value: u.id, label: u.email }))}
                selectedValues={form.participantIds}
                onChange={(val) => setForm({ ...form, participantIds: val })}
            />

            <SingleSelectCombobox
                key={form.cv}
                options={cvs.map((cv) => ({
                    value: cv.id,
                    label: `${cv.title} - ${cv.user?.email || "unknown"}`,
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
                onChange={(e) => setForm({ ...form, statusEvent: e.target.value })}
            >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
            </select>

            <div className="flex flex-wrap gap-2 justify-between mt-4">
                <Button
                    onClick={onClose}
                    className="rounded-md bg-white text-[#14346b] border border-[#14346b] hover:bg-[#e5e7eb] px-4 py-2 font-medium"
                >
                    Cancel
                </Button>

                {form.id && (
                    <Button
                        onClick={async () => {
                            try {
                                await GlobalAPI.DeleteCalendarEvent(form.id);
                                await refreshCalendar();
                                setForm(emptyForm());
                                onClose();

                            } catch (err) {
                                console.error("❌ Delete failed:", err);
                            }
                        }}
                        className="rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 px-4 py-2 font-medium shadow-sm"
                    >
                        – Remove
                    </Button>

                )}

                <Button
                    onClick={async () => {
                        await onSave();     // Salvează
                        onClose();          // Închide formularul
                        setForm(emptyForm()); // Curăță formularul după închidere
                    }}
                    className="rounded-md bg-[#14346b] hover:bg-[#16887f] text-white px-4 py-2 font-medium"
                >
                    Save
                </Button>

            </div>
        </div>
    );
}

export default EventForm;