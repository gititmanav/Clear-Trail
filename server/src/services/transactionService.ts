import { Types } from "mongoose";
import { Transaction } from "../models/Transaction.js";
import { ApiError } from "../utils/apiError.js";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../validators/transactionSchema.js";

interface TransactionQuery {
  type?: "income" | "expense";
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const transactionService = {
  async getAll(companyId: string, query: TransactionQuery) {
    const {
      type,
      category,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = "date",
      sortOrder = "desc",
    } = query;

    const companyOid = new Types.ObjectId(companyId);

    // Build filter
    const filter: Record<string, unknown> = { companyId: companyOid };

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      filter.date = dateFilter;
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Sort
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate("userId", "name email")
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return {
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  },

  async getById(id: string, companyId: string) {
    const transaction = await Transaction.findOne({
      _id: id,
      companyId: new Types.ObjectId(companyId),
    }).populate("userId", "name email");

    if (!transaction) {
      throw ApiError.notFound("Transaction not found");
    }

    return transaction;
  },

  async create(
    input: CreateTransactionInput,
    userId: string,
    companyId: string
  ) {
    const transaction = await Transaction.create({
      ...input,
      date: new Date(input.date),
      userId: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(companyId),
    });

    return transaction;
  },

  async update(
    id: string,
    input: UpdateTransactionInput,
    companyId: string
  ) {
    const updateData: Record<string, unknown> = { ...input };
    if (input.date) {
      updateData.date = new Date(input.date);
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, companyId: new Types.ObjectId(companyId) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      throw ApiError.notFound("Transaction not found");
    }

    return transaction;
  },

  async delete(id: string, companyId: string) {
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      companyId: new Types.ObjectId(companyId),
    });

    if (!transaction) {
      throw ApiError.notFound("Transaction not found");
    }

    return { message: "Transaction deleted" };
  },

  async getSummary(companyId: string) {
    const companyOid = new Types.ObjectId(companyId);

    const [totals, monthlyTrend] = await Promise.all([
      Transaction.aggregate([
        { $match: { companyId: companyOid } },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { companyId: companyOid } },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]),
    ]);

    const income = totals.find((t) => t._id === "income");
    const expense = totals.find((t) => t._id === "expense");

    return {
      totalIncome: income?.total ?? 0,
      totalExpenses: expense?.total ?? 0,
      netBalance: (income?.total ?? 0) - (expense?.total ?? 0),
      transactionCount: (income?.count ?? 0) + (expense?.count ?? 0),
      monthlyTrend,
    };
  },
};
