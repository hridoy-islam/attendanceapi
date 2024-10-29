import { Schema, model } from "mongoose";
import { TComment } from "./comment.interface";

const commentSchema = new Schema<TComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "task",
    },
    content: {
      type: String,
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);


export const Comment = model<TComment>("Comment", commentSchema);