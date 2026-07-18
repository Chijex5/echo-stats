import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ChatMessageDoc extends Document {
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<ChatMessageDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Every read is "give me this user's history in order" — this is the only
// query pattern the route needs.
ChatMessageSchema.index({ userId: 1, createdAt: 1 });

const ChatMessage: Model<ChatMessageDoc> =
  (mongoose.models.ChatMessage as Model<ChatMessageDoc>) ||
  mongoose.model<ChatMessageDoc>("ChatMessage", ChatMessageSchema);

export default ChatMessage;