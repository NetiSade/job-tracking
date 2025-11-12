import { JobStatus } from "../types";

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
