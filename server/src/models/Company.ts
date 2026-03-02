import { Schema, model, type Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
  },
  {
    timestamps: true,
  }
);

export const Company = model<ICompany>("Company", companySchema);
