import { useState } from 'react';
import type { Job, CreateJobInput, UpdateJobInput } from '@job-tracking/shared';
import { Loader2, MessageSquare, ChevronDown, ChevronUp, Plus, Edit, Trash2 } from 'lucide-react';
import { formatDateTime } from '@job-tracking/shared';
import { useJobs } from '../hooks/useJobs';
import { JobFormModal } from '../components/JobFormModal';
import './Dashboard.css';

export const Dashboard = () => {
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [activeTab, setActiveTab] = useState<'wishlist' | 'in_progress' | 'archived'>('wishlist');

    const {
        jobs,
        isLoading,
        error,
        createJob,
        updateJob,
        deleteJob,
        addComment,
        updateComment,
        deleteComment,
    } = useJobs();

    if (isLoading) {
        return (
            <div className="loading-state">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (error) {
        return <div className="error-state">Error loading jobs</div>;
    }

    const toggleExpanded = (jobId: string) => {
        setExpandedJobId(expandedJobId === jobId ? null : jobId);
    };

    const handleOpenAddModal = () => {
        setEditingJob(null);
        setIsFormOpen(true);
    };

    const handleOpenEditModal = (job: Job) => {
        setEditingJob(job);
        setIsFormOpen(true);
    };

    const handleCloseModal = () => {
        setIsFormOpen(false);
        setEditingJob(null);
    };

    const handleSubmitJob = async (data: CreateJobInput | UpdateJobInput) => {
        if (editingJob) {
            await updateJob(editingJob.id, data as UpdateJobInput);
        } else {
            await createJob(data as CreateJobInput);
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            await deleteJob(jobId);
        }
    };

    const handleAddComment = async (jobId: string) => {
        const content = commentInputs[jobId]?.trim();
        if (!content) return;

        await addComment(jobId, content);
        setCommentInputs({ ...commentInputs, [jobId]: '' });
    };

    const handleStartEditComment = (commentId: string, currentText: string) => {
        setEditingCommentId(commentId);
        setEditingCommentText(currentText);
    };

    const handleSaveComment = async (commentId: string) => {
        if (!editingCommentText.trim()) return;

        await updateComment(commentId, editingCommentText.trim());
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            await deleteComment(commentId);
        }
    };

    // Group jobs by status
    const jobsByStatus = {
        wishlist: jobs?.filter((job: Job) => job.status === 'wishlist') || [],
        in_progress: jobs?.filter((job: Job) => job.status === 'in_progress') || [],
        archived: jobs?.filter((job: Job) => job.status === 'archived') || [],
    };

    // Job Card Component
    interface JobCardProps {
        job: Job;
    }

    const JobCard = ({ job }: JobCardProps) => {
        const isExpanded = expandedJobId === job.id;
        const commentCount = job.comments?.length || 0;

        return (
            <div className="job-card">
                <div className="job-card-header">
                    <div className="job-info">
                        <h3>{job.position}</h3>
                        <p className="company">{job.company}</p>
                    </div>
                    <div className="job-actions">
                        <button
                            className="icon-btn"
                            onClick={() => handleOpenEditModal(job)}
                            title="Edit job"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            className="icon-btn delete-btn"
                            onClick={() => handleDeleteJob(job.id)}
                            title="Delete job"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {job.salary_expectations && (
                    <div className="job-meta">
                        <span className="salary">💰 {job.salary_expectations}</span>
                    </div>
                )}

                {/* Comments Section */}
                <div className="comments-section">
                    <button
                        className="comments-toggle"
                        onClick={() => toggleExpanded(job.id)}
                    >
                        <MessageSquare size={16} />
                        <span>{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isExpanded && (
                        <div className="comments-list">
                            {/* Add Comment Form */}
                            <div className="add-comment-form">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentInputs[job.id] || ''}
                                    onChange={(e) => setCommentInputs({
                                        ...commentInputs,
                                        [job.id]: e.target.value
                                    })}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddComment(job.id);
                                        }
                                    }}
                                />
                                <button
                                    className="btn-sm"
                                    onClick={() => handleAddComment(job.id)}
                                    disabled={!commentInputs[job.id]?.trim()}
                                >
                                    Add
                                </button>
                            </div>

                            {/* Comments List */}
                            {commentCount === 0 ? (
                                <p className="no-comments">No comments yet</p>
                            ) : (
                                job.comments.map((comment) => (
                                    <div key={comment.id} className="comment">
                                        {editingCommentId === comment.id ? (
                                            <div className="edit-comment-form">
                                                <input
                                                    type="text"
                                                    value={editingCommentText}
                                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSaveComment(comment.id);
                                                        }
                                                        if (e.key === 'Escape') {
                                                            handleCancelEditComment();
                                                        }
                                                    }}
                                                    autoFocus
                                                />
                                                <div className="edit-actions">
                                                    <button
                                                        className="btn-sm"
                                                        onClick={() => handleSaveComment(comment.id)}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        className="btn-sm btn-secondary"
                                                        onClick={handleCancelEditComment}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="comment-header">
                                                    <span className="comment-date">
                                                        {formatDateTime(comment.created_at)}
                                                    </span>
                                                    <div className="comment-actions">
                                                        <button
                                                            className="icon-btn-sm"
                                                            onClick={() => handleStartEditComment(comment.id, comment.content)}
                                                            title="Edit comment"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            className="icon-btn-sm delete-btn"
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            title="Delete comment"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="comment-content">{comment.content}</p>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Column Component
    interface ColumnProps {
        title: string;
        icon: string;
        jobs: Job[];
    }

    const Column = ({ title, icon, jobs: columnJobs }: ColumnProps) => {
        return (
            <div className="kanban-column">
                <div className="column-header">
                    <h3>{icon} {title}</h3>
                    <span className="job-count">{columnJobs.length}</span>
                </div>
                <div className="column-content">
                    {columnJobs.length === 0 ? (
                        <p className="empty-column">No jobs yet</p>
                    ) : (
                        columnJobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>My Career Journey 👨‍💻👩‍💻</h2>
                <button className="btn-primary" onClick={handleOpenAddModal}>
                    <Plus size={20} />
                    <span>Add Job</span>
                </button>
            </div>

            {/* Tabs Navigation - Visible on small screens */}
            <div className="tabs-navigation">
                <button
                    className={`tab-button ${activeTab === 'wishlist' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wishlist')}
                >
                    <span className="tab-icon">🌟</span>
                    <span className="tab-label">Exploring</span>
                    <span className="tab-count">{jobsByStatus.wishlist.length}</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'in_progress' ? 'active' : ''}`}
                    onClick={() => setActiveTab('in_progress')}
                >
                    <span className="tab-icon">🚀</span>
                    <span className="tab-label">Taking Action</span>
                    <span className="tab-count">{jobsByStatus.in_progress.length}</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'archived' ? 'active' : ''}`}
                    onClick={() => setActiveTab('archived')}
                >
                    <span className="tab-icon">📂</span>
                    <span className="tab-label">Archived</span>
                    <span className="tab-count">{jobsByStatus.archived.length}</span>
                </button>
            </div>

            {/* Tabs View - Single column for mobile */}
            <div className="tabs-view">
                <Column
                    title="" // Title hidden in mobile view via CSS if needed, or just empty
                    icon=""
                    jobs={jobsByStatus[activeTab]}
                />
            </div>

            {/* Kanban Board - Multi-column for desktop */}
            <div className="kanban-board">
                <Column
                    title="Exploring"
                    icon="🌟"
                    jobs={jobsByStatus.wishlist}
                />
                <Column
                    title="Taking Action"
                    icon="🚀"
                    jobs={jobsByStatus.in_progress}
                />
                <Column
                    title="Archived"
                    icon="📂"
                    jobs={jobsByStatus.archived}
                />
            </div>

            <JobFormModal
                isOpen={isFormOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitJob}
                job={editingJob}
            />
        </div>
    );
};
