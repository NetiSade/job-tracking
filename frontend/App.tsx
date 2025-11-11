import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import AppHeader from "./components/AppHeader";
import FilterTabs from "./components/FilterTabs";
import FloatingActionButton from "./components/FloatingActionButton";
import JobFormModal from "./components/JobFormModal";
import JobCommentsModal from "./components/JobCommentsModal";
import JobList from "./components/JobList";
import LoadingScreen from "./components/LoadingScreen";
import ErrorScreen from "./components/ErrorScreen";
import { useAuth } from "./hooks/useAuth";
import { useJobs } from "./hooks/useJobs";
import { Job, CreateJobInput, UpdateJobInput } from "./types";

export default function App(): JSX.Element {
  const { isAuthenticating, isAuthenticated } = useAuth();
  const {
    jobs,
    loading,
    activeFilter,
    setActiveFilter,
    loadJobs,
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    getFilteredJobs,
    getJobCountByStatus,
  } = useJobs(isAuthenticated);

  const [isJobFormVisible, setIsJobFormVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [visibleCommentsJobId, setVisibleCommentsJobId] = useState<string | null>(
    null
  );
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);

  const commentJob = useMemo(
    () =>
      visibleCommentsJobId
        ? jobs.find((job) => job.id === visibleCommentsJobId) ?? null
        : null,
    [jobs, visibleCommentsJobId]
  );

  const handleOpenAddModal = useCallback((): void => {
    setEditingJob(null);
    setIsJobFormVisible(true);
  }, []);

  const handleEditJob = useCallback((job: Job): void => {
    setEditingJob(job);
    setIsJobFormVisible(true);
  }, []);

  const handleCloseJobForm = useCallback((): void => {
    setEditingJob(null);
    setIsJobFormVisible(false);
  }, []);

  const handleSubmitJob = useCallback(
    async (jobData: CreateJobInput | UpdateJobInput): Promise<void> => {
      if (editingJob) {
        await handleUpdateJob(editingJob.id, jobData as UpdateJobInput);
      } else {
        await handleCreateJob(jobData as CreateJobInput);
      }
      handleCloseJobForm();
    },
    [editingJob, handleUpdateJob, handleCreateJob, handleCloseJobForm]
  );

  const handleViewComments = useCallback((job: Job): void => {
    setVisibleCommentsJobId(job.id);
    setIsCommentsModalVisible(true);
  }, []);

  const handleCloseComments = useCallback((): void => {
    setIsCommentsModalVisible(false);
    setVisibleCommentsJobId(null);
  }, []);

  if (isAuthenticating) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingScreen />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        activeCount={getJobCountByStatus("in_progress")}
        wishlistCount={getJobCountByStatus("wishlist")}
      />

      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        getJobCount={getJobCountByStatus}
        totalJobs={jobs.length}
      />

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
            onViewComments={handleViewComments}
          />
        </View>
      </ScrollView>

      <FloatingActionButton onPress={handleOpenAddModal} />

      <JobFormModal
        visible={isJobFormVisible}
        onClose={handleCloseJobForm}
        onSubmit={handleSubmitJob}
        initialValues={editingJob}
      />

      <JobCommentsModal
        visible={isCommentsModalVisible}
        job={commentJob}
        onClose={handleCloseComments}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  listSection: {
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 80,
  },
});
