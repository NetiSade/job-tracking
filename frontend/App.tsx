import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import JobFormModal from "./components/JobFormModal";
import JobList from "./components/JobList";
import { fetchJobs, createJob, updateJob, deleteJob } from "./services/api";
import { signInAnonymously } from "./services/auth";
import { Job, CreateJobInput, UpdateJobInput, JobStatus } from "./types";

export default function App(): JSX.Element {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<JobStatus | "all">(
    "in_progress"
  );

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      const token = await signInAnonymously();
      if (token) {
        setIsAuthenticated(true);
        loadJobs();
      } else {
        Alert.alert("Error", "Failed to initialize app. Please restart.");
      }
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert("Error", "Failed to initialize app. Please restart.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadJobs = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (jobData: CreateJobInput): Promise<void> => {
    try {
      const newJob = await createJob(jobData);
      setJobs([newJob, ...jobs]);
      Alert.alert("Success", "Job added successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to create job");
    }
  };

  const handleUpdateJob = async (jobData: UpdateJobInput): Promise<void> => {
    if (!editingJob) return;

    try {
      const updatedJob = await updateJob(editingJob.id, jobData);
      setJobs(jobs.map((job) => (job.id === editingJob.id ? updatedJob : job)));
      setEditingJob(null);
      Alert.alert("Success", "Job updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update job");
    }
  };

  const handleDeleteJob = async (jobId: string): Promise<void> => {
    Alert.alert("Delete Job", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteJob(jobId);
            setJobs(jobs.filter((job) => job.id !== jobId));
            Alert.alert("Success", "Job deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete job");
          }
        },
      },
    ]);
  };

  const handleEditJob = (job: Job): void => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setEditingJob(null);
    setShowModal(false);
  };

  const handleOpenAddModal = (): void => {
    setEditingJob(null);
    setShowModal(true);
  };

  const getFilteredJobs = (): Job[] => {
    if (activeFilter === "all") {
      return jobs;
    }
    return jobs.filter((job) => job.status === activeFilter);
  };

  const getJobCountByStatus = (status: JobStatus): number => {
    return jobs.filter((job) => job.status === status).length;
  };

  // Show loading spinner while authenticating
  if (isAuthenticating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to initialize app</Text>
          <Text style={styles.errorSubtext}>
            Please restart the application
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Job Tracker</Text>
          <Text style={styles.headerSubtitle}>
            {getJobCountByStatus("in_progress")} active •{" "}
            {getJobCountByStatus("wishlist")} wishlist
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "in_progress" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("in_progress")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "in_progress" && styles.filterTabTextActive,
              ]}
            >
              In Progress ({getJobCountByStatus("in_progress")})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "wishlist" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("wishlist")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "wishlist" && styles.filterTabTextActive,
              ]}
            >
              Wishlist ({getJobCountByStatus("wishlist")})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "archived" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("archived")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "archived" && styles.filterTabTextActive,
              ]}
            >
              Archived ({getJobCountByStatus("archived")})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "all" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "all" && styles.filterTabTextActive,
              ]}
            >
              All ({jobs.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Job List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadJobs} />
        }
      >
        <View style={styles.listSection}>
          <JobList
            jobs={getFilteredJobs()}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenAddModal}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Job Form Modal */}
      <JobFormModal
        visible={showModal}
        onClose={handleCloseModal}
        onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
        initialValues={editingJob}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4a90e2",
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  filterTabActive: {
    backgroundColor: "#4a90e2",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  filterTabTextActive: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
  },
  listSection: {
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 80,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: "#ffffff",
    fontWeight: "300",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e74c3c",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#999",
  },
});
