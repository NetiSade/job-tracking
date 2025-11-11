import { useState, useEffect, useCallback } from "react";
import { Job, JobStatus, JobPriority, PickerOption } from "../types";

interface UseJobFormReturn {
  company: string;
  position: string;
  status: JobStatus;
  priority: JobPriority;
  showStatusPicker: boolean;
  showPriorityPicker: boolean;
  isSubmitting: boolean;
  setCompany: (value: string) => void;
  setPosition: (value: string) => void;
  setStatus: (value: JobStatus) => void;
  setPriority: (value: JobPriority) => void;
  setShowStatusPicker: (value: boolean) => void;
  setShowPriorityPicker: (value: boolean) => void;
  setIsSubmitting: (value: boolean) => void;
  resetForm: () => void;
  statusOptions: PickerOption[];
  priorityOptions: PickerOption[];
}

export const useJobForm = (initialValues?: Job | null): UseJobFormReturn => {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobStatus>("wishlist");
  const [priority, setPriority] = useState<JobPriority>("medium");
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions: PickerOption[] = [
    { label: "Wishlist", value: "wishlist" },
    { label: "In Progress", value: "in_progress" },
    { label: "Archived", value: "archived" },
  ];

  const priorityOptions: PickerOption[] = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ];

  const resetForm = useCallback((): void => {
    setCompany("");
    setPosition("");
    setStatus("wishlist");
    setPriority("medium");
    setShowStatusPicker(false);
    setShowPriorityPicker(false);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (initialValues) {
      setCompany(initialValues.company || "");
      setPosition(initialValues.position || "");
      setStatus(initialValues.status || "wishlist");
      setPriority(initialValues.priority || "medium");
    } else {
      resetForm();
    }
  }, [initialValues, resetForm]);

  return {
    company,
    position,
    status,
    priority,
    showStatusPicker,
    showPriorityPicker,
    isSubmitting,
    setCompany,
    setPosition,
    setStatus,
    setPriority,
    setShowStatusPicker,
    setShowPriorityPicker,
    setIsSubmitting,
    resetForm,
    statusOptions,
    priorityOptions,
  };
};
