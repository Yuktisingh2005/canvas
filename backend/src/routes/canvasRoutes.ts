import { Router } from "express";
import {
  createCanvas,
  listCanvases,
  getCanvas,
  updateCanvas,
  deleteCanvas,
} from "../controllers/canvasController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import { createCanvasSchema, updateCanvasSchema } from "../utils/schemas";

const router = Router();

// Every canvas route requires a valid JWT.
router.use(authMiddleware);

router.post("/", validate(createCanvasSchema), createCanvas);
router.get("/", listCanvases);
router.get("/:id", getCanvas);
router.put("/:id", validate(updateCanvasSchema), updateCanvas);
router.delete("/:id", deleteCanvas);

export default router;