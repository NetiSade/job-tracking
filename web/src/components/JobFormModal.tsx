import { useState, useEffect } from 'react';
import type { Job, CreateJobInput, UpdateJobInput, JobStatus } from '@job-tracking/shared';
import { STATUS_OPTIONS } from '@job-tracking/shared';
import { X } from 'lucide-react';
import './JobFormModal.css';

interface JobFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateJobInput | UpdateJobInput) => Promise<void>;
    job?: Job | null;
}

export const JobFormModal = ({ isOpen, onClose, onSubmit, job }: JobFormModalProps) => {
    const [company, setCompany] = useState('');
    const [position, setPosition] = useState('');
    const [status, setStatus] = useState<JobStatus>('wishlist');
    const [salary, setSalary] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (job) {
                setCompany(job.company);
                setPosition(job.position);
                setStatus(job.status);
                setSalary(job.salary_expectations || '');
            } else {
                setCompany('');
                setPosition('');
                setStatus('wishlist');
                setSalary('');
            }
        }
    }, [job, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!company.trim() || !position.trim()) {
            alert("Please fill in company and position");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                company: company.trim(),
                position: position.trim(),
                status,
                salary_expectations: salary.trim() || null,
            });
            onClose();
        } catch (error) {
            console.error('Failed to submit job:', error);
            alert('Failed to save job');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{job ? 'Edit Job' : 'Add New Job'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="job-form">
                    <div className="form-group">
                        <label htmlFor="company">Company *</label>
                        <input
                            id="company"
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g., Google"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="position">Position *</label>
                        <input
                            id="position"
                            type="text"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder="e.g., Software Engineer"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as JobStatus)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="salary">Target Compensation</label>
                        <input
                            id="salary"
                            type="text"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            placeholder="e.g., $120k base"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
