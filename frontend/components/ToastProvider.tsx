import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, View, Text } from "react-native";

type ToastType = "default" | "success" | "error";

interface ToastConfig {
  message: string;
  type: ToastType;
}

interface ToastOptions {
  duration?: number;
  type?: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const DEFAULT_DURATION = 2000;

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const nextToast: ToastConfig = {
        message,
        type: options?.type ?? "default",
      };

      clearHideTimeout();
      setToast(nextToast);
      setIsVisible(true);

      hideTimeout.current = setTimeout(
        hideToast,
        options?.duration ?? DEFAULT_DURATION
      );
    },
    [clearHideTimeout, hideToast]
  );

  useEffect(() => {
    if (isVisible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    } else if (toast) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setToast(null);
        }
      });
    }
  }, [isVisible, opacity, toast]);

  useEffect(
    () => () => {
      clearHideTimeout();
    },
    [clearHideTimeout]
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast,
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={styles.container}>
          <Animated.View
            style={[
              styles.toast,
              styles[`toast_${toast.type}`],
              { opacity },
            ]}
          >
            <Text style={styles.toastText}>{toast.message}</Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  toast: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  toast_default: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  toast_success: {
    backgroundColor: "#1f9142",
  },
  toast_error: {
    backgroundColor: "#c0392b",
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

