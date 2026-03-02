import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema, updateUserSchema } from "../validators/userSchema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get("/", asyncHandler(userController.getAll));
router.get("/:id", asyncHandler(userController.getById));

// Only owner and admin can create, update, delete users
router.post(
  "/",
  authorize("owner", "admin"),
  validate(createUserSchema),
  asyncHandler(userController.create)
);
router.put(
  "/:id",
  authorize("owner", "admin"),
  validate(updateUserSchema),
  asyncHandler(userController.update)
);
router.delete(
  "/:id",
  authorize("owner", "admin"),
  asyncHandler(userController.delete)
);

export default router;
