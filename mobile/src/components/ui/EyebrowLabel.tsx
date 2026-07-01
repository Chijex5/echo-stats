import { Text } from "react-native";
import { cn } from "@/lib/cn";

type EyebrowLabelProps = {
  children: string;
  className?: string;
};

export function EyebrowLabel({ children, className }: EyebrowLabelProps) {
  return (
    <Text
      className={cn(
        "text-10 font-sans text-white/35 uppercase tracking-widest2",
        className
      )}
    >
      {children}
    </Text>
  );
}
