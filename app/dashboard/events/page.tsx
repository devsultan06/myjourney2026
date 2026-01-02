"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  MapPin,
  Users,
  ExternalLink,
  Trash2,
  Edit,
  Video,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Checkbox from "@/components/ui/Checkbox";

interface Event {
  id: string;
  name: string;
  type:
    | "conference"
    | "meetup"
    | "workshop"
    | "webinar"
    | "hackathon"
    | "other";
  date: string;
  location: string;
  isVirtual: boolean;
  description?: string | null;
  takeaways?: string | null;
  url?: string | null;
  attendees?: number | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "meetup",
    date: "",
    location: "",
    isVirtual: false,
    description: "",
    takeaways: "",
    url: "",
    attendees: "",
  });

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: events.length,
    conferences: events.filter((e) => e.type === "conference").length,
    meetups: events.filter((e) => e.type === "meetup").length,
    workshops: events.filter((e) => e.type === "workshop").length,
  };

  // Group events by month
  const groupedEvents = events.reduce((acc, event) => {
    const monthYear = new Date(event.date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      name: "",
      type: "meetup",
      date: "",
      location: "",
      isVirtual: false,
      description: "",
      takeaways: "",
      url: "",
      attendees: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      type: event.type,
      date: new Date(event.date).toISOString().split("T")[0],
      location: event.location,
      isVirtual: event.isVirtual,
      description: event.description || "",
      takeaways: event.takeaways || "",
      url: event.url || "",
      attendees: event.attendees?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingEvent) {
        // Update existing event
        const response = await fetch(`/api/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            type: formData.type,
            date: formData.date,
            location: formData.location,
            isVirtual: formData.isVirtual,
            description: formData.description,
            takeaways: formData.takeaways,
            url: formData.url,
            attendees: formData.attendees,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(
            events.map((e) => (e.id === editingEvent.id ? data.event : e))
          );
        }
      } else {
        // Create new event
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            type: formData.type,
            date: formData.date,
            location: formData.location,
            isVirtual: formData.isVirtual,
            description: formData.description,
            takeaways: formData.takeaways,
            url: formData.url,
            attendees: formData.attendees,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(
            [data.event, ...events].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
          );
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save event:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(events.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const getTypeBadge = (type: Event["type"]) => {
    const variants: Record<
      Event["type"],
      {
        variant:
          | "default"
          | "success"
          | "warning"
          | "info"
          | "purple"
          | "error";
        label: string;
      }
    > = {
      conference: { variant: "purple", label: "🎤 Conference" },
      meetup: { variant: "info", label: "👥 Meetup" },
      workshop: { variant: "warning", label: "🛠️ Workshop" },
      webinar: { variant: "default", label: "💻 Webinar" },
      hackathon: { variant: "success", label: "⚡ Hackathon" },
      other: { variant: "default", label: "📅 Event" },
    };
    const { variant, label } = variants[type];
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Attended</h1>
          <p className="text-gray-600">
            Track conferences, meetups, and workshops
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: stats.total, color: "bg-indigo-100" },
          {
            label: "Conferences",
            value: stats.conferences,
            color: "bg-purple-100",
          },
          { label: "Meetups", value: stats.meetups, color: "bg-blue-100" },
          {
            label: "Workshops",
            value: stats.workshops,
            color: "bg-yellow-100",
          },
        ].map((stat) => (
          <Card key={stat.label} className={stat.color} padding="sm">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Timeline View */}
      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title="No events yet"
          description="Start tracking the events you attend"
          action={
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
            <div key={monthYear}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {monthYear}
              </h3>
              <div className="space-y-4">
                {monthEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card hover>
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Date Column */}
                        <div className="flex-shrink-0 w-20 text-center">
                          <div className="text-3xl font-bold text-indigo-600">
                            {new Date(event.date).getDate()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                        </div>

                        {/* Event Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {event.name}
                                </h4>
                                {getTypeBadge(event.type)}
                                {event.isVirtual && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Video className="w-3 h-3" />
                                    Virtual
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-gray-600">
                                {event.description}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {event.url && (
                                <a
                                  href={event.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(event)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(event.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                            {event.attendees && (
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {event.attendees.toLocaleString()} attendees
                              </span>
                            )}
                          </div>

                          {/* Takeaways */}
                          {event.takeaways && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h5 className="text-sm font-medium text-gray-700 mb-1">
                                Key Takeaways
                              </h5>
                              <p className="text-sm text-gray-600">
                                {event.takeaways}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? "Edit Event" : "Add Event"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event Name"
            placeholder="e.g., React Summit 2026"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Event Type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              options={[
                { value: "conference", label: "🎤 Conference" },
                { value: "meetup", label: "👥 Meetup" },
                { value: "workshop", label: "🛠️ Workshop" },
                { value: "webinar", label: "💻 Webinar" },
                { value: "hackathon", label: "⚡ Hackathon" },
                { value: "other", label: "📅 Other" },
              ]}
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="e.g., San Francisco, CA"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
            <Input
              label="Attendees"
              type="number"
              placeholder="e.g., 500"
              value={formData.attendees}
              onChange={(e) =>
                setFormData({ ...formData, attendees: e.target.value })
              }
            />
          </div>
          <Checkbox
            checked={formData.isVirtual}
            onChange={(checked) =>
              setFormData({ ...formData, isVirtual: checked })
            }
            label="This is a virtual event"
          />
          <Textarea
            label="Description"
            placeholder="What is this event about?"
            rows={2}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Textarea
            label="Key Takeaways"
            placeholder="What did you learn? Any memorable moments?"
            rows={3}
            value={formData.takeaways}
            onChange={(e) =>
              setFormData({ ...formData, takeaways: e.target.value })
            }
          />
          <Input
            label="Event URL"
            placeholder="https://..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSaving}>
              {editingEvent ? "Save Changes" : "Add Event"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
