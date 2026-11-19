import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Users,
  CheckCircle,
  Clock,
  ExternalLink,
  Github,
  Check
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';

export const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // New Project Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [tags, setTags] = useState('React, Python, AI');

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/');
      const list = res.data.results || res.data || [];
      setProjects(list);
      if (list.length > 0 && !selectedProject) {
        setSelectedProject(list[0]);
      } else if (selectedProject) {
        const updated = list.find((p) => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleJoinProject = async (proj) => {
    if (!user) return;
    try {
      await api.post(`/projects/${proj.id}/join/`);
      fetchProjects();
    } catch (err) {
      console.error('Failed to join project:', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      const res = await api.post('/projects/', {
        title,
        description,
        github_repo_url: githubUrl,
        tags: tags.split(',').map((t) => t.trim()),
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      fetchProjects();
      setSelectedProject(res.data);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !selectedProject) return;

    try {
      await api.post(`/projects/${selectedProject.id}/create_task/`, {
        title: taskTitle,
        description: taskDesc,
      });
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      fetchProjects();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (!selectedProject) return;
    try {
      await api.patch(`/projects/${selectedProject.id}/update-task/${taskId}/`, {
        status: newStatus,
      });
      fetchProjects();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-purple-300" />
            Student Projects & Hackathon Workspace
          </h2>
          <p className="text-xs text-purple-100 max-w-lg mt-1">
            Build together, recruit collaborators across universities, and manage agile Kanban tasks.
          </p>
        </div>

        {user && (
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 font-bold"
          >
            New Project
          </Button>
        )}
      </div>

      {/* Main Layout: Project Selector & Kanban Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Project Selector Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Projects ({projects.length})
          </h3>

          <div className="space-y-2">
            {projects.map((p) => {
              const isSelected = selectedProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.owner?.username}'s Team</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-emerald-600 font-semibold">{p.tasks?.length || 0} tasks</span>
                    <span>•</span>
                    <span className="text-[10px] text-slate-400">{p.members?.length || 1} members</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kanban Task Workspace */}
        <div className="lg:col-span-3 space-y-4">
          {selectedProject ? (
            <>
              {/* Project Details Bar */}
              <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedProject.title}</h3>
                    {selectedProject.is_looking_for_members && (
                      <Badge variant="success" size="sm">Looking for Collaborators</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                    {selectedProject.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {selectedProject.github_repo_url && (
                      <a
                        href={selectedProject.github_repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        <Github className="w-3.5 h-3.5" /> Repository
                      </a>
                    )}
                    {selectedProject.tags?.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!selectedProject.is_member && user && (
                    <Button variant="primary" size="sm" onClick={() => handleJoinProject(selectedProject)}>
                      Join Team
                    </Button>
                  )}
                  <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowTaskModal(true)}>
                    Add Task
                  </Button>
                </div>
              </Card>

              {/* Kanban 3-Column Board */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Column: To Do */}
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      To Do
                    </span>
                    <Badge variant="default" size="sm">
                      {selectedProject.tasks?.filter((t) => t.status === 'TODO').length || 0}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {selectedProject.tasks
                      ?.filter((t) => t.status === 'TODO')
                      .map((task) => (
                        <Card key={task.id} className="p-3.5 space-y-2 bg-white dark:bg-slate-900">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{task.title}</h5>
                          {task.description && <p className="text-[11px] text-slate-500">{task.description}</p>}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Start →
                            </button>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Column: In Progress */}
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      In Progress
                    </span>
                    <Badge variant="primary" size="sm">
                      {selectedProject.tasks?.filter((t) => t.status === 'IN_PROGRESS').length || 0}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {selectedProject.tasks
                      ?.filter((t) => t.status === 'IN_PROGRESS')
                      .map((task) => (
                        <Card key={task.id} className="p-3.5 space-y-2 border-indigo-200 dark:border-indigo-800">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{task.title}</h5>
                          {task.description && <p className="text-[11px] text-slate-500">{task.description}</p>}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, 'DONE')}
                              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              Complete ✓
                            </button>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Column: Done */}
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Completed
                    </span>
                    <Badge variant="success" size="sm">
                      {selectedProject.tasks?.filter((t) => t.status === 'DONE').length || 0}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {selectedProject.tasks
                      ?.filter((t) => t.status === 'DONE')
                      .map((task) => (
                        <Card key={task.id} className="p-3.5 space-y-2 opacity-80">
                          <h5 className="text-xs font-bold line-through text-slate-500">{task.title}</h5>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon={FolderGit2}
              title="No project selected"
              description="Choose a project on the left or create a new student collaboration."
            />
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Student Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input label="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Description & Goals
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <Input label="GitHub Repository URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
          <Input label="Tech Stack Tags (Comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Create Project</Button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Add Task to Project">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input label="Task Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Write integration test suite for REST API" required />
          <Input label="Details / Acceptance Criteria" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowTaskModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Add Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
