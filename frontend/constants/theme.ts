export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  error: string;
  success: string;
  wishlist: string;
  inProgress: string;
  archived: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  headerBackground: string;
  headerText: string;
}

export const lightColors: ThemeColors = {
  background: "#F8F3E7", // steamed-milk beige
  card: "#FFFFFF",
  text: "#352A22", // roasted coffee bean
  textSecondary: "#7A6A5A", // mocha foam

  primary: "#C27149", // ✨ burnt caramel syrup
  border: "#E6D9C9",

  error: "#D9534F", // cherry roasted beans
  success: "#5CAB7D", // matcha-mint finish

  wishlist: "#D9A441", // honey gold
  inProgress: "#C27149", // warm ristretto highlight
  archived: "#A99C92", // soft oat-grey cappuccino

  tint: "#C27149",
  tabIconDefault: "#B2A697",
  tabIconSelected: "#C27149",

  headerBackground: "#c67750ff", // caramel top note
  headerText: "#FFFFFF",
};

export const darkColors: ThemeColors = {
  background: "#1B110D", // dark roast base (Unchanged: deep background)
  card: "#33231A", // ☕ Darker, more distinct surface color

  text: "#E8DCCF", // oat milk cream (Unchanged: light text)
  textSecondary: "#BFAE9F", // warm latte foam (Unchanged: secondary text)

  primary: "#D4895E", // 🍂 caramel-hazelnut glow (Unchanged: primary actions)
  border: "#4D3A2C", // Border slightly lighter than background/card for clear separation

  error: "#E56A5A", // chili-roast red (Unchanged)
  success: "#6DC58A", // mint-leaf aftertaste (Unchanged)

  wishlist: "#E1B059", // golden crema (Unchanged)
  inProgress: "#D4895E", // (Unchanged)
  archived: "#8A766A", // faded mocha (Unchanged)

  tint: "#D4895E", // (Unchanged)
  tabIconDefault: "#7A6A5E", // (Unchanged)
  tabIconSelected: "#D4895E", // (Unchanged)

  headerBackground: "#2D1C14", // warm mahogany (Unchanged: slightly darker than card)
  headerText: "#E8DCCF", // (Unchanged)
};
