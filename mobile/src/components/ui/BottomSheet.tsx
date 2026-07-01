import { Modal, View, Pressable, type ViewStyle } from "react-native";
import { MotiView } from "moti";
import { X } from "lucide-react-native";
import { sheetSlideUp } from "@/lib/motion/presets";
import { overlay, alpha } from "@/lib/theme/tokens";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Caps the sheet panel's height, e.g. "85%" for tall dynamic content. */
  maxHeight?: ViewStyle["maxHeight"];
};

// Shared scaffold for every bottom-sheet modal in the app (scrim + slide-up
// panel + close button) — was hand-rolled three separate times
// (RandomNostalgiaSheet, DateRangeSheet, ShareSheet) with drifting scrim/
// panel colors and corner radii.
export function BottomSheet({ visible, onClose, children, maxHeight }: BottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: overlay.scrim, justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <MotiView {...sheetSlideUp} style={maxHeight ? { maxHeight } : undefined}>
            <View
              className="rounded-t-sheet border-t border-white/[0.08] px-6 pb-10 pt-6"
              style={{ backgroundColor: overlay.sheetPanel }}
            >
              <Pressable
                onPress={onClose}
                className="absolute right-5 top-5 h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05]"
              >
                <X size={12} color={alpha.white(0.5)} />
              </Pressable>
              {children}
            </View>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
