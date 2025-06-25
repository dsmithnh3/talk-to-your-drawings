import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const colors = {
  background: {
    light: "rgba(252, 252, 249, 1)",
    dark: "rgba(31, 33, 33, 1)",
  },
  surface: {
    light: "rgba(255, 255, 253, 1)",
    dark: "rgba(38, 40, 40, 1)",
  },
  text: {
    light: "rgba(19, 52, 59, 1)",
    dark: "rgba(245, 245, 245, 1)",
  },
  textSecondary: {
    light: "rgba(98, 108, 113, 1)",
    dark: "rgba(167, 169, 169, 0.7)",
  },
  primary: {
    light: "rgba(33, 128, 141, 1)",
    dark: "rgba(50, 184, 198, 1)",
  },
  primaryHover: {
    light: "rgba(29, 116, 128, 1)",
    dark: "rgba(45, 166, 178, 1)",
  },
  primaryActive: {
    light: "rgba(26, 104, 115, 1)",
    dark: "rgba(41, 150, 161, 1)",
  },
  secondary: {
    light: "rgba(94, 82, 64, 0.12)",
    dark: "rgba(119, 124, 124, 0.15)",
  },
  error: {
    light: "rgba(192, 21, 47, 1)",
    dark: "rgba(255, 84, 89, 1)",
  },
  success: {
    light: "rgba(33, 128, 141, 1)",
    dark: "rgba(50, 184, 198, 1)",
  },
  warning: {
    light: "rgba(168, 75, 47, 1)",
    dark: "rgba(230, 129, 97, 1)",
  },
  info: {
    light: "rgba(98, 108, 113, 1)",
    dark: "rgba(167, 169, 169, 1)",
  },
};

const fonts = {
  heading:
    "FKGroteskNeue, Geist, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  body: "FKGroteskNeue, Geist, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  mono: "Berkeley Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const theme = extendTheme({
  config,
  colors: {
    ...colors,
    brand: colors.primary,
  },
  fonts,
  styles: {
    global: (props: any) => ({
      body: {
        bg:
          props.colorMode === "dark"
            ? colors.background.dark
            : colors.background.light,
        color:
          props.colorMode === "dark" ? colors.text.dark : colors.text.light,
      },
    }),
  },
});

export default theme;
