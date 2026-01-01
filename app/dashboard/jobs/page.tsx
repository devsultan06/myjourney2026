"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  ExternalLink,
  Trash2,
  Edit,
  Building,
  DollarSign,
} from "lucide-react";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { JobApplication } from "@/lib/types";
import { generateId, formatDate } from "@/lib/utils";

// Mock data
const initialJobs: JobApplication[] = [
  {
    id: "1",
    company: "TechCorp",
    position: "Senior Frontend Developer",
    location: "San Francisco, CA",
    type: "hybrid",
    status: "interview",
    appliedDate: new Date("2026-01-10"),
    salary: "$180k - $220k",
    notes: "Great culture, interesting tech stack",
    url: "https://techcorp.com/careers",
    contacts: [],
    timeline: [],
  },
  {
    id: "2",
    company: "StartupXYZ",
    position: "Full Stack Engineer",
    location: "New York, NY",
    type: "remote",
    status: "applied",
    appliedDate: new Date("2026-01-12"),
    salary: "$150k - $180k",
    notes: "Early stage startup, equity package",
    contacts: [],
    timeline: [],
  },
  {
    id: "3",
    company: "BigTech Inc",
    position: "Software Engineer",
    location: "Seattle, WA",
    type: "onsite",
    status: "screening",
    appliedDate: new Date("2026-01-08"),
    salary: "$200k - $250k",
    notes: "FAANG company, tough interview process",
    contacts: [],
    timeline: [],
  },
];

const statusSteps = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "accepted",
] as const;

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    type: "remote",
    status: "applied",
    salary: "",
    notes: "",
    url: "",
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => !["rejected", "accepted"].includes(j.status))
      .length,
    interviews: jobs.filter((j) => j.status === "interview").length,
    offers: jobs.filter((j) => j.status === "offer").length,
  };

  const openAddModal = () => {
    setEditingJob(null);
    setFormData({
      company: "",
      position: "",
      location: "",
      type: "remote",
      status: "applied",
      salary: "",
      notes: "",
      url: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobApplication) => {
    setEditingJob(job);
    setFormData({
      company: job.company,
      position: job.position,
      location: job.location,
      type: job.type,
      status: job.status,
      salary: job.salary || "",
      notes: job.notes,
      url: job.url || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const jobData: JobApplication = {
      id: editingJob?.id || generateId(),
      company: formData.company,
      position: formData.position,
      location: formData.location,
      type: formData.type as JobApplication["type"],
      status: formData.status as JobApplication["status"],
      appliedDate: formData.status !== "wishlist" ? new Date() : undefined,
      salary: formData.salary || undefined,
      notes: formData.notes,
      url: formData.url || undefined,
      contacts: editingJob?.contacts || [],
      timeline: editingJob?.timeline || [],
    };

    if (editingJob) {
      setJobs(jobs.map((j) => (j.id === editingJob.id ? jobData : j)));
    } else {
      setJobs([jobData, ...jobs]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const getStatusBadge = (status: JobApplication["status"]) => {
    const variants: Record<
      JobApplication["status"],
      {
        variant:
          | "default"
          | "success"
          | "warning"
          | "error"
          | "info"
          | "purple";
        label: string;
      }
    > = {
      wishlist: { variant: "default", label: "Wishlist" },
      applied: { variant: "info", label: "Applied" },
      screening: { variant: "purple", label: "Screening" },
      interview: { variant: "warning", label: "Interview" },
      offer: { variant: "success", label: "Offer" },
      rejected: { variant: "error", label: "Rejected" },
      accepted: { variant: "success", label: "Accepted" },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeBadge = (type: JobApplication["type"]) => {
    const labels: Record<JobApplication["type"], string> = {
      remote: "🏠 Remote",
      hybrid: "🔄 Hybrid",
      onsite: "🏢 Onsite",
    };
    return <span className="text-xs text-gray-500">{labels[type]}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-gray-600">Track your job search progress</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Applications",
            value: stats.total,
            color: "bg-gray-100",
          },
          { label: "Active", value: stats.active, color: "bg-blue-100" },
          {
            label: "Interviews",
            value: stats.interviews,
            color: "bg-yellow-100",
          },
          { label: "Offers", value: stats.offers, color: "bg-green-100" },
        ].map((stat) => (
          <Card key={stat.label} className={stat.color} padding="sm">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Pipeline View */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {statusSteps.map((status) => {
            const statusJobs = jobs.filter((j) => j.status === status);
            return (
              <div key={status} className="w-72 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700 capitalize">
                    {status}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {statusJobs.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {statusJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      layout
                      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {job.position}
                          </h4>
                          <p className="text-sm text-gray-500">{job.company}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(job)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                      {job.salary && (
                        <div className="mt-1 flex items-center gap-2 text-sm text-green-600">
                          <DollarSign className="w-3 h-3" />
                          {job.salary}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="wishlist">Wishlist</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications ({filteredJobs.length})</CardTitle>
        </CardHeader>
        {filteredJobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-8 h-8" />}
            title="No jobs found"
            description="Add jobs or adjust your filters"
            action={
              <Button onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Job
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <Building className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {job.position}
                      </h4>
                      <p className="text-sm text-gray-600">{job.company}</p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    {getTypeBadge(job.type)}
                    {job.appliedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(job.appliedDate)}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                      </span>
                    )}
                  </div>
                  {job.notes && (
                    <p className="mt-2 text-sm text-gray-600">{job.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(job)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? "Edit Job" : "Add Job Application"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company"
              placeholder="e.g., TechCorp"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              required
            />
            <Input
              label="Position"
              placeholder="e.g., Senior Engineer"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
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
              label="Salary Range"
              placeholder="e.g., $150k - $180k"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Work Type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              options={[
                { value: "remote", label: "Remote" },
                { value: "hybrid", label: "Hybrid" },
                { value: "onsite", label: "Onsite" },
              ]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              options={[
                { value: "wishlist", label: "Wishlist" },
                { value: "applied", label: "Applied" },
                { value: "screening", label: "Screening" },
                { value: "interview", label: "Interview" },
                { value: "offer", label: "Offer" },
                { value: "rejected", label: "Rejected" },
                { value: "accepted", label: "Accepted" },
              ]}
            />
          </div>
          <Input
            label="Job URL"
            placeholder="https://..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <Textarea
            label="Notes"
            placeholder="Interview notes, company culture, etc."
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
              {editingJob ? "Save Changes" : "Add Job"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
