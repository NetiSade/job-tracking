import React, { useState, useCallback, useMemo, useEffect } from "react";
import { StyleSheet, View, Alert, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavigation } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppHeader from "../components/AppHeader";
import FloatingActionButton from "../components/FloatingActionButton";
import JobFormModal from "../components/JobFormModal";
import JobCommentsModal from "../components/JobCommentsModal";
import JobList from "../components/JobList";
import LoadingScreen from "../components/LoadingScreen";
import { SettingsModal } from "../components/SettingsModal";
import { AboutScreen } from "../screens/AboutScreen";
import { WelcomeModal } from "../components/WelcomeModal";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../hooks/useAuth";
import { useJobs } from "../hooks/useJobs";
import { Job, CreateJobInput, UpdateJobInput, JobStatus } from "../types";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { ThemeColors } from "../constants/theme";
import { useTheme } from "react-native-paper";
import { useTheme as useCustomTheme } from "../context/ThemeContext";

const STATUS_LABELS: Record<JobStatus, string> = {
    wishlist: "🌟 Exploring",
    in_progress: "🚀 Taking Action",
    archived: "📂 Archived",
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
        handleReorderJobs,
    } = useJobs(isAuthenticated);
    const { showToast } = useToast();
    const styles = useThemedStyles(stylesFactory);
    const isDark = useTheme();

    const [isJobFormVisible, setIsJobFormVisible] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [visibleCommentsJobId, setVisibleCommentsJobId] = useState<
        string | null
    >(null);
    const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
    const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(false);

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
                // Creating a new job
                await handleCreateJob(jobData as CreateJobInput);
                // Navigate to the tab matching the new job's status
                const newJobStatus = (jobData as CreateJobInput).status;
                setActiveFilter(newJobStatus);
            }
            handleCloseJobForm();
        },
        [editingJob, handleUpdateJob, handleCreateJob, handleCloseJobForm, setActiveFilter]
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
                    "Ready to take action? 🚀",
                    `Let's start working on "${job.position}" at ${job.company}!`,
                    [
                        { text: "Not yet", style: "cancel" },
                        {
                            text: "Let's do it!",
                            onPress: applyStatusChange,
                        },
                    ]
                );
                return;
            }

            Alert.alert(
                "Update Journey Stage",
                `Ready to move "${job.position}" at ${job.company} to ${STATUS_LABELS[status]}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Update",
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

    // Check if this is the first time opening the app
    useEffect(() => {
        const checkFirstLaunch = async () => {
            try {
                const hasSeenWelcome = await AsyncStorage.getItem("hasSeenWelcome");
                if (!hasSeenWelcome) {
                    setIsWelcomeModalVisible(true);
                }
            } catch (error) {
                console.error("Error checking first launch:", error);
            }
        };
        checkFirstLaunch();
    }, []);

    const handleCloseWelcome = useCallback(async () => {
        try {
            await AsyncStorage.setItem("hasSeenWelcome", "true");
            setIsWelcomeModalVisible(false);
        } catch (error) {
            console.error("Error saving welcome state:", error);
        }
    }, []);

    if (isAuthenticating) {
        return (
            <SafeAreaView style={styles.container}>
                <LoadingScreen />
            </SafeAreaView>
        );
    }

    const [index, setIndex] = useState(0);
    const customTheme = useCustomTheme();

    const routes = useMemo(
        () => [
            {
                key: "in_progress",
                title: "Taking Action",
                focusedIcon: "rocket",
                unfocusedIcon: "rocket-outline",
                // badge: getJobCountByStatus("in_progress"),
            },
            {
                key: "wishlist",
                title: "Exploring",
                focusedIcon: "star",
                unfocusedIcon: "star-outline",
                // badge: getJobCountByStatus("wishlist"),
            },
            {
                key: "archived",
                title: "Archived",
                focusedIcon: "folder",
                unfocusedIcon: "folder-outline",
                // badge: getJobCountByStatus("archived"),
            },
        ],
        []
    );

    // Sync bottom nav index with active filter
    React.useEffect(() => {
        const routeIndex = routes.findIndex((route) => route.key === activeFilter);
        if (routeIndex !== -1 && routeIndex !== index) {
            setIndex(routeIndex);
        }
    }, [activeFilter, routes, index]);

    const renderScene = useCallback(
        ({ route }: { route: { key: string } }) => {
            const status = route.key as JobStatus;
            const filteredJobs = jobs.filter((job) => job.status === status);

            return (
                <View style={styles.listSection}>
                    <JobList
                        jobs={filteredJobs}
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
            );
        },
        [jobs, handleEditJob, handleDeleteJob, handleViewComments, handleChangeJobStatus, handleReorderJobs, loading, loadJobs]
    );

    const handleIndexChange = useCallback(
        (newIndex: number) => {
            setIndex(newIndex);
            setActiveFilter(routes[newIndex].key as JobStatus);
        },
        [routes, setActiveFilter]
    );

    return (
        <View style={[styles.container, { backgroundColor: customTheme.colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <AppHeader onSettingsPress={() => setIsSettingsModalVisible(true)} />

            <BottomNavigation
                navigationState={{ index, routes }}
                onIndexChange={handleIndexChange}
                renderScene={renderScene}
                barStyle={{ backgroundColor: customTheme.colors.card }}
                activeColor={customTheme.colors.primary}
                inactiveColor={customTheme.colors.textSecondary}
            />

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

            <SettingsModal
                visible={isSettingsModalVisible}
                onClose={() => setIsSettingsModalVisible(false)}
                onAboutPress={() => {
                    setIsSettingsModalVisible(false);
                    setIsAboutModalVisible(true);
                }}
            />

            <AboutScreen
                visible={isAboutModalVisible}
                onClose={() => setIsAboutModalVisible(false)}
            />

            <WelcomeModal
                visible={isWelcomeModalVisible}
                onClose={handleCloseWelcome}
            />
        </View>
    );
};

const stylesFactory = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listSection: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 0,
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    welcomeText: {
        marginBottom: 8,
        fontWeight: "bold",
        color: colors.text,
    },
    subtitleText: {
        marginBottom: 32,
        color: colors.textSecondary,
    },
});

export default HomeScreen;
