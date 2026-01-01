"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Plus,
  Calendar,
  ExternalLink,
  Github,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import { StartupProject, Milestone } from "@/lib/types";
import { generateId, formatDate } from "@/lib/utils";

// Mock data
const initialProjects: StartupProject[] = [
  {
    id: "1",
    name: "My2026Journey",
    description: "Personal productivity and life-tracking platform",
    status: "building",
    startDate: new Date("2026-01-01"),
    targetLaunchDate: new Date("2026-03-01"),
    technologies: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
    milestones: [
      { id: "m1", title: "Landing page", description: "", status: "completed" },
      {
        id: "m2",
        title: "Dashboard MVP",
        description: "",
        status: "in-progress",
      },
      { id: "m3", title: "Authentication", description: "", status: "pending" },
      {
        id: "m4",
        title: "Database integration",
        description: "",
        status: "pending",
      },
    ],
    progress: 35,
    notes: "Building in public, sharing progress on Twitter",
    githubUrl: "https://github.com/user/my2026journey",
  },
  {
    id: "2",
    name: "CodeTracker CLI",
    description: "Command-line tool to track coding time",
    status: "idea",
    startDate: new Date("2026-01-10"),
    technologies: ["Rust", "SQLite"],
    milestones: [],
    progress: 5,
    notes: "Exploring Rust for this project",
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<StartupProject[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<StartupProject | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "idea",
    targetLaunchDate: "",
    technologies: "",
    notes: "",
    url: "",
    githubUrl: "",
  });

  const stats = {
    total: projects.length,
    building: projects.filter((p) => p.status === "building").length,
    launched: projects.filter(
      (p) => p.status === "launched" || p.status === "completed"
    ).length,
    ideas: projects.filter((p) => p.status === "idea").length,
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      name: "",
      description: "",
      status: "idea",
      targetLaunchDate: "",
      technologies: "",
      notes: "",
      url: "",
      githubUrl: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: StartupProject) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      targetLaunchDate: project.targetLaunchDate
        ? new Date(project.targetLaunchDate).toISOString().split("T")[0]
        : "",
      technologies: project.technologies.join(", "),
      notes: project.notes,
      url: project.url || "",
      githubUrl: project.githubUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData: StartupProject = {
      id: editingProject?.id || generateId(),
      name: formData.name,
      description: formData.description,
      status: formData.status as StartupProject["status"],
      startDate: editingProject?.startDate || new Date(),
      targetLaunchDate: formData.targetLaunchDate
        ? new Date(formData.targetLaunchDate)
        : undefined,
      technologies: formData.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      milestones: editingProject?.milestones || [],
      progress: editingProject?.progress || 0,
      notes: formData.notes,
      url: formData.url || undefined,
      githubUrl: formData.githubUrl || undefined,
    };

    if (editingProject) {
      setProjects(
        projects.map((p) => (p.id === editingProject.id ? projectData : p))
      );
    } else {
      setProjects([projectData, ...projects]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          const updatedMilestones = p.milestones.map((m) => {
            if (m.id === milestoneId) {
              const newStatus: Milestone["status"] =
                m.status === "completed" ? "pending" : "completed";
              return {
                ...m,
                status: newStatus,
                completedDate:
                  newStatus === "completed" ? new Date() : undefined,
              };
            }
            return m;
          });
          const completedCount = updatedMilestones.filter(
            (m) => m.status === "completed"
          ).length;
          const newProgress = updatedMilestones.length
            ? Math.round((completedCount / updatedMilestones.length) * 100)
            : 0;
          return { ...p, milestones: updatedMilestones, progress: newProgress };
        }
        return p;
      })
    );
  };

  const getStatusBadge = (status: StartupProject["status"]) => {
    const variants: Record<
      StartupProject["status"],
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
      idea: { variant: "default", label: "💡 Idea" },
      planning: { variant: "info", label: "📝 Planning" },
      building: { variant: "warning", label: "🔨 Building" },
      launched: { variant: "success", label: "🚀 Launched" },
      paused: { variant: "default", label: "⏸️ Paused" },
      completed: { variant: "success", label: "✅ Completed" },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Startup Projects</h1>
          <p className="text-gray-600">
            Track your side projects and milestones
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: stats.total, color: "bg-gray-100" },
          { label: "Building", value: stats.building, color: "bg-yellow-100" },
          { label: "Launched", value: stats.launched, color: "bg-green-100" },
          { label: "Ideas", value: stats.ideas, color: "bg-blue-100" },
        ].map((stat) => (
          <Card key={stat.label} className={stat.color} padding="sm">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<Rocket className="w-8 h-8" />}
          title="No projects yet"
          description="Start tracking your startup ideas and projects"
          action={
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Project Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {project.name}
                          </h3>
                          {getStatusBadge(project.status)}
                        </div>
                        <p className="mt-1 text-gray-600">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(project)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Progress
                        </span>
                        <span className="text-sm text-gray-500">
                          {project.progress}%
                        </span>
                      </div>
                      <ProgressBar value={project.progress} color="indigo" />
                    </div>

                    {/* Dates */}
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Started {formatDate(project.startDate)}
                      </span>
                      {project.targetLaunchDate && (
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Target: {formatDate(project.targetLaunchDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Milestones */}
                  {project.milestones.length > 0 && (
                    <div className="lg:w-80 bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Milestones
                      </h4>
                      <div className="space-y-2">
                        {project.milestones.map((milestone) => (
                          <button
                            key={milestone.id}
                            onClick={() =>
                              toggleMilestone(project.id, milestone.id)
                            }
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          >
                            {milestone.status === "completed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : milestone.status === "in-progress" ? (
                              <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            )}
                            <span
                              className={`text-sm ${
                                milestone.status === "completed"
                                  ? "text-gray-500 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              {milestone.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {project.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{project.notes}</p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project" : "New Project"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g., My Awesome SaaS"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="What does this project do?"
            rows={2}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              options={[
                { value: "idea", label: "💡 Idea" },
                { value: "planning", label: "📝 Planning" },
                { value: "building", label: "🔨 Building" },
                { value: "launched", label: "🚀 Launched" },
                { value: "paused", label: "⏸️ Paused" },
                { value: "completed", label: "✅ Completed" },
              ]}
            />
            <Input
              label="Target Launch Date"
              type="date"
              value={formData.targetLaunchDate}
              onChange={(e) =>
                setFormData({ ...formData, targetLaunchDate: e.target.value })
              }
            />
          </div>
          <Input
            label="Technologies (comma separated)"
            placeholder="e.g., Next.js, TypeScript, PostgreSQL"
            value={formData.technologies}
            onChange={(e) =>
              setFormData({ ...formData, technologies: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="GitHub URL"
              placeholder="https://github.com/..."
              value={formData.githubUrl}
              onChange={(e) =>
                setFormData({ ...formData, githubUrl: e.target.value })
              }
            />
            <Input
              label="Live URL"
              placeholder="https://..."
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
            />
          </div>
          <Textarea
            label="Notes"
            placeholder="Project notes, ideas, progress updates..."
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
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
            <Button type="submit" className="flex-1">
              {editingProject ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
