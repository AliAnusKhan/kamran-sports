import mongoose from "mongoose";

const ChampionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models?.Champion || mongoose.model("Champion", ChampionSchema);