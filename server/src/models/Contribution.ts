import { Schema, model, Document, Types } from "mongoose";

export interface IContribution extends Document {
  amount: number;
  note?: string;
  isAnonymous: boolean;
  isRepayable?: boolean;
  confirmed?: boolean;
  name?: string | null;
  contributor?: Types.ObjectId | null;
  createdAt: Date;
}

const ContributionSchema = new Schema<IContribution>(
  {
    amount: { type: Number, required: true, min: 0 },
    note: { type: String },
    isAnonymous: { type: Boolean, default: false },
    // whether this contribution is expected to be repaid (loan) or is a gift
    isRepayable: { type: Boolean, default: false },
    confirmed: { type: Boolean, default: false },
    name: { type: String, default: null },
    // keep schema minimal: store contributor name and ref; pending/finalize flows removed
    contributor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export default model<IContribution>("Contribution", ContributionSchema);
