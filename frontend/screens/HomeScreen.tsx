import React, { useState, useCallback, useMemo } from "react";
import { StyleSheet, View, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import FilterTabs from "../components/FilterTabs";
import FloatingActionButton from "../components/FloatingActionButton";
import JobFormModal from "../components/JobFormModal";
import JobCommentsModal from "../components/JobCommentsModal";
import JobList from "../components/JobList";
import LoadingScreen from "../components/LoadingScreen";
import ErrorScreen from "../components/ErrorScreen";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../hooks/useAuth";
import { useJobs } from "../hooks/useJobs";
import { Job, CreateJobInput, UpdateJobInput, JobStatus } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { ThemeColors } from "../constants/theme";

const STATUS_LABELS: Record<JobStatus, string> = {
    wishlist: "Wishlist",
    in_progress: "In Progress",
    archived: "Archived",
};

const HomeScreen: React.FC = () => {
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
        handleReorderJobs,
    } = useJobs(isAuthenticated);
    const { showToast } = useToast();
    const { isDark } = useTheme();
    const styles = useThemedStyles(stylesFactory);

    const [isJobFormVisible, setIsJobFormVisible] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [visibleCommentsJobId, setVisibleCommentsJobId] = useState<
        string | null
    >(null);
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

    const handleChangeJobStatus = useCallback(
        (job: Job, status: JobStatus) => {
            if (status === job.status) {
                return;
            }

            const applyStatusChange = async (): Promise<void> => {
                try {
                    await handleUpdateJob(job.id, { status }, { successMessage: false });
                    showToast(`Moved to ${STATUS_LABELS[status]}`, { type: "success" });
                } catch (error) {
                    console.error("Failed to update status", error);
                }
            };

            if (job.status === "wishlist" && status === "in_progress") {
                Alert.alert(
                    "Time to take action!",
                    `Ready to start working on "${job.position}" at ${job.company}?`,
                    [
                        { text: "Not yet", style: "cancel" },
                        {
                            text: "Let's do it",
                            onPress: applyStatusChange,
                        },
                    ]
                );
                return;
            }

            Alert.alert(
                "Change Status",
                `Move "${job.position}" at ${job.company} to ${STATUS_LABELS[status]}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Change",
                        onPress: applyStatusChange,
                    },
                ]
            );
        },
        [handleUpdateJob]
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
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <AppHeader />

            <FilterTabs
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                getJobCount={getJobCountByStatus}
            />

            <View style={styles.content}>
                <View style={styles.listSection}>
                    <JobList
                        jobs={getFilteredJobs()}
                        onEdit={handleEditJob}
                        onDelete={handleDeleteJob}
                        onViewComments={handleViewComments}
                        onChangeStatus={handleChangeJobStatus}
                        onReorder={handleReorderJobs}
                        refreshing={loading}
                        onRefresh={() => {
                            void loadJobs();
                        }}
                    />
                </View>
            </View>

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
};

const stylesFactory = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
    listSection: {
        flex: 1,
        marginTop: 15,
        marginHorizontal: 15,
        marginBottom: 80,
    },
});

export default HomeScreen;
