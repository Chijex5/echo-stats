import { ScrollView, type ScrollViewProps } from "react-native";
import { spacing } from "@/lib/theme/tokens";

// Every tab screen scrolled its content inside the same
// { paddingHorizontal: 20, paddingTop: 72, paddingBottom: 140 } object,
// copy-pasted per file. Centralized here as the shared screen-content inset
// (clears the status bar/notch above and the floating tab bar below).
export function ScreenScroll({ children, contentContainerStyle, ...props }: ScrollViewProps) {
  return (
    <ScrollView
      contentContainerStyle={[
        { paddingHorizontal: spacing.screenX, paddingTop: spacing.screenTop, paddingBottom: spacing.screenBottom },
        contentContainerStyle,
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
