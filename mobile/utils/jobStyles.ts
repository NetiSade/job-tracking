import { ThemeColors } from "../constants/theme";
import { JobStatus } from "../types";

export const getStatusColor = (status: JobStatus, colors: ThemeColors): string => {
  switch (status) {
    case "wishlist":
      return colors.wishlist;
    case "in_progress":
      return colors.inProgress;
    case "archived":
      return colors.archived;
    default:
      return colors.archived; // fallback
  }
};
