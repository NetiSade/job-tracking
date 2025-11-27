import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { lightColors, darkColors, ThemeColors } from "../constants/theme";

type ThemeType = "light" | "dark";

interface ThemeContextType {
    theme: ThemeType;
    colors: ThemeColors;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState<ThemeType>(systemScheme === "dark" ? "dark" : "light");

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem("user_theme");
                if (savedTheme) {
                    setTheme(savedTheme as ThemeType);
                } else if (systemScheme) {
                    setTheme(systemScheme as ThemeType);
                }
            } catch (error) {
                console.error("Failed to load theme", error);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem("user_theme", newTheme);
        } catch (error) {
            console.error("Failed to save theme", error);
        }
    };

    const colors = theme === "dark" ? darkColors : lightColors;

    return (
        <ThemeContext.Provider
            value={{
                theme,
                colors,
                toggleTheme,
                isDark: theme === "dark",
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
