import { ScrollView, type ScrollViewProps } from "react-native";
import { cn } from "@/lib/cn";

// Every tab screen scrolled its content inside the same
// { paddingHorizontal: 20, paddingTop: 72, paddingBottom: 140 } object,
// copy-pasted per file. Centralized here as the shared screen-content inset
// (clears the status bar/notch above and the floating tab bar below).
export function ScreenScroll({ children, contentContainerClassName, ...props }: ScrollViewProps) {
  return (
    <ScrollView
      contentContainerClassName={cn("px-screen-x pt-screen-top pb-screen-bottom", contentContainerClassName)}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
