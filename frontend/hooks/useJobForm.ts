import { useState, useEffect, useCallback } from "react";
import { Job, JobStatus, PickerOption } from "../types";
import { STATUS_OPTIONS } from "../utils/statusMapping";

interface UseJobFormReturn {
  company: string;
  position: string;
  status: JobStatus;
  salaryExpectations: string;
  showStatusPicker: boolean;
  isSubmitting: boolean;
  setCompany: (value: string) => void;
  setPosition: (value: string) => void;
  setStatus: (value: JobStatus) => void;
  setSalaryExpectations: (value: string) => void;
  setShowStatusPicker: (value: boolean) => void;
  setIsSubmitting: (value: boolean) => void;
  resetForm: () => void;
  statusOptions: PickerOption[];
}

export const useJobForm = (initialValues?: Job | null): UseJobFormReturn => {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobStatus>("wishlist");
  const [salaryExpectations, setSalaryExpectations] = useState("");
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions: PickerOption[] = STATUS_OPTIONS;

  const resetForm = useCallback((): void => {
    setCompany("");
    setPosition("");
    setStatus("wishlist");
    setSalaryExpectations("");
    setShowStatusPicker(false);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (initialValues) {
      setCompany(initialValues.company || "");
      setPosition(initialValues.position || "");
      setStatus(initialValues.status || "wishlist");
      setSalaryExpectations(initialValues.salary_expectations || "");
    } else {
      resetForm();
    }
  }, [initialValues, resetForm]);

  return {
    company,
    position,
    status,
    salaryExpectations,
    showStatusPicker,
    isSubmitting,
    setCompany,
    setPosition,
    setStatus,
    setSalaryExpectations,
    setShowStatusPicker,
    setIsSubmitting,
    resetForm,
    statusOptions,
  };
};
