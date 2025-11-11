import { JobStatus, JobPriority } from "../types";

export const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case "wishlist":
      return "#9b59b6";
    case "in_progress":
      return "#3498db";
    case "archived":
      return "#95a5a6";
    default:
      return "#7f8c8d";
  }
};

export const getPriorityColor = (priority: JobPriority): string => {
  switch (priority) {
    case "high":
      return "#e74c3c";
    case "medium":
      return "#f39c12";
    case "low":
      return "#2ecc71";
    default:
      return "#7f8c8d";
  }
};
