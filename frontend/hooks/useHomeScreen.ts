import { useState, useCallback, useMemo, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../hooks/useAuth";
import { useJobs } from "../hooks/useJobs";
import { Job, CreateJobInput, UpdateJobInput, JobStatus } from "../types";
import { useTheme } from "react-native-paper";
import { Logger } from "../services/logger";
import { STATUS_LABELS, STATUS_TITLES } from "../utils/statusMapping";

export const useHomeScreen = () => {
    const { isAuthenticating, isAuthenticated } = useAuth();
    const {
        jobs,
        loading,
        isInitialLoading,
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
    const isDark = useTheme();

    // State hooks
    const [isJobFormVisible, setIsJobFormVisible] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [visibleCommentsJobId, setVisibleCommentsJobId] = useState<string | null>(null);
    const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
    const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(false);
    const [index, setIndex] = useState(0);

    // Memoized values
    const commentJob = useMemo(
        () =>
            visibleCommentsJobId
                ? jobs.find((job) => job.id === visibleCommentsJobId) ?? null
                : null,
        [visibleCommentsJobId, jobs]
    );

    const routes = useMemo(
        () => [
            {
                key: "in_progress",
                title: STATUS_TITLES.in_progress,
                focusedIcon: "rocket",
                unfocusedIcon: "rocket-outline",
            },
            {
                key: "wishlist",
                title: STATUS_TITLES.wishlist,
                focusedIcon: "star",
                unfocusedIcon: "star-outline",
            },
            {
                key: "archived",
                title: STATUS_TITLES.archived,
                focusedIcon: "folder",
                unfocusedIcon: "folder-outline",
            },
        ],
        []
    );

    // Callbacks
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

            const applyStatusChange = async () => {
                try {
                    await handleUpdateJob(job.id, { status }, { successMessage: false });
                    showToast(
                        `"${job.position}" at ${job.company} moved to ${STATUS_LABELS[status]}`,
                        { type: "success" }
                    );
                } catch (error) {
                    Logger.error("[HomeScreen] Failed to update job status", error);
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
        [handleUpdateJob, showToast]
    );

    const handleViewComments = useCallback((job: Job): void => {
        setVisibleCommentsJobId(job.id);
        setIsCommentsModalVisible(true);
    }, []);

    const handleCloseComments = useCallback((): void => {
        setIsCommentsModalVisible(false);
        setVisibleCommentsJobId(null);
    }, []);

    const handleCloseWelcome = useCallback(async () => {
        try {
            await AsyncStorage.setItem("hasSeenWelcome", "true");
            setIsWelcomeModalVisible(false);
        } catch (error) {
            Logger.error("Error saving welcome state:", error);
        }
    }, []);

    const handleIndexChange = useCallback(
        (newIndex: number) => {
            setIndex(newIndex);
            setActiveFilter(routes[newIndex].key as JobStatus);
        },
        [routes, setActiveFilter]
    );

    // Effects
    // Check if this is the first time opening the app
    useEffect(() => {
        const checkFirstLaunch = async () => {
            try {
                const hasSeenWelcome = await AsyncStorage.getItem("hasSeenWelcome");
                if (!hasSeenWelcome) {
                    setIsWelcomeModalVisible(true);
                }
            } catch (error) {
                Logger.error("Error checking first launch:", error);
            }
        };
        checkFirstLaunch();
    }, []);

    // Sync bottom nav index with active filter
    useEffect(() => {
        const routeIndex = routes.findIndex((route) => route.key === activeFilter);
        if (routeIndex !== -1 && routeIndex !== index) {
            setIndex(routeIndex);
        }
    }, [activeFilter, routes, index]);

    return {
        isAuthenticating,
        isAuthenticated,
        isInitialLoading,
        loading,
        jobs,
        activeFilter,
        loadJobs,
        handleDeleteJob,
        handleAddComment,
        handleUpdateComment,
        handleDeleteComment,
        handleReorderJobs,
        isDark,
        isJobFormVisible,
        editingJob,
        isCommentsModalVisible,
        isSettingsModalVisible,
        setIsSettingsModalVisible,
        isAboutModalVisible,
        setIsAboutModalVisible,
        isWelcomeModalVisible,
        index,
        routes,
        commentJob,
        handleOpenAddModal,
        handleEditJob,
        handleCloseJobForm,
        handleSubmitJob,
        handleChangeJobStatus,
        handleViewComments,
        handleCloseComments,
        handleCloseWelcome,
        handleIndexChange,
    };
};
