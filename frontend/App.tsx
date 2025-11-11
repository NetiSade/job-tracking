import React, { useState, useCallback } from "react";
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
import JobList from "./components/JobList";
import LoadingScreen from "./components/LoadingScreen";
import ErrorScreen from "./components/ErrorScreen";
import { useAuth } from "./hooks/useAuth";
import { useJobs } from "./hooks/useJobs";
import { Job } from "./types";

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
    getFilteredJobs,
    getJobCountByStatus,
  } = useJobs(isAuthenticated);

  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const handleOpenAddModal = useCallback((): void => {
    setEditingJob(null);
    setShowModal(true);
  }, []);

  const handleEditJob = useCallback((job: Job): void => {
    setEditingJob(job);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback((): void => {
    setEditingJob(null);
    setShowModal(false);
  }, []);

  const handleSubmit = useCallback(
    async (jobData: any): Promise<void> => {
      if (editingJob) {
        await handleUpdateJob(editingJob.id, jobData);
      } else {
        await handleCreateJob(jobData);
      }
      handleCloseModal();
    },
    [editingJob, handleUpdateJob, handleCreateJob, handleCloseModal]
  );

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
          />
        </View>
      </ScrollView>

      <FloatingActionButton onPress={handleOpenAddModal} />

      <JobFormModal
        visible={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
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
  content: {
    flex: 1,
  },
  listSection: {
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 80,
  },
});
