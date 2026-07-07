import { Modal, View, Pressable, StyleSheet, type ViewStyle } from "react-native";
import { MotiView } from "moti";
import { X } from "lucide-react-native";
import { sheetSlideUp } from "@/lib/motion/presets";
import { overlay, alpha, radius } from "@/lib/theme/tokens";

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
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <MotiView {...sheetSlideUp} style={maxHeight ? { maxHeight } : undefined}>
            <View style={styles.panel}>
              <Pressable onPress={onClose} style={styles.closeButton}>
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

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: overlay.scrim, justifyContent: "flex-end" },
  panel: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderTopWidth: 1,
    borderColor: alpha.white(0.08),
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
    backgroundColor: overlay.sheetPanel,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 20,
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: alpha.white(0.08),
    backgroundColor: alpha.white(0.05),
  },
});
