import type { Request, Response } from "express";
import { transactionService } from "../services/transactionService.js";

export const transactionController = {
  async getAll(req: Request, res: Response) {
    const companyId = req.user!.companyId.toString();
    const result = await transactionService.getAll(companyId, req.query as Record<string, string>);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const companyId = req.user!.companyId.toString();
    const transaction = await transactionService.getById(req.params.id!, companyId);
    res.json(transaction);
  },

  async create(req: Request, res: Response) {
    const userId = req.user!._id.toString();
    const companyId = req.user!.companyId.toString();
    const transaction = await transactionService.create(req.body, userId, companyId);
    res.status(201).json(transaction);
  },

  async update(req: Request, res: Response) {
    const companyId = req.user!.companyId.toString();
    const transaction = await transactionService.update(req.params.id!, req.body, companyId);
    res.json(transaction);
  },

  async delete(req: Request, res: Response) {
    const companyId = req.user!.companyId.toString();
    const result = await transactionService.delete(req.params.id!, companyId);
    res.json(result);
  },

  async getSummary(req: Request, res: Response) {
    const companyId = req.user!.companyId.toString();
    const summary = await transactionService.getSummary(companyId);
    res.json(summary);
  },
};
