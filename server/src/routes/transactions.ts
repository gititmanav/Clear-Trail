import { Router } from "express";
import { transactionController } from "../controllers/transactionController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../validators/transactionSchema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

router.get("/summary", asyncHandler(transactionController.getSummary));
router.get("/", asyncHandler(transactionController.getAll));
router.get("/:id", asyncHandler(transactionController.getById));
router.post("/", validate(createTransactionSchema), asyncHandler(transactionController.create));
router.put("/:id", validate(updateTransactionSchema), asyncHandler(transactionController.update));
router.delete("/:id", asyncHandler(transactionController.delete));

export default router;
