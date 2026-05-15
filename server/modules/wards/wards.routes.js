import { Router } from 'express';
import * as wardsController from './wards.controller.js';
import {
  validateCreateWard,
  validateCreateRoom,
  validateCreateBed,
  validateUpdateBedStatus,
} from './wards.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Wards
 *   description: Ward, room, and bed management
 */

/**
 * @swagger
 * /wards/stats:
 *   get:
 *     summary: Get ward occupancy statistics
 *     tags: [Wards]
 *     responses:
 *       200:
 *         description: Ward stats with bed availability counts
 *       403:
 *         description: Forbidden — ADMIN only
 */
router.get('/stats', authorize('ADMIN'), wardsController.getWardStats);

/**
 * @swagger
 * /wards:
 *   post:
 *     summary: Create a new ward
 *     tags: [Wards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cardiology Ward
 *               type:
 *                 type: string
 *                 example: general
 *               capacity:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Ward created
 *       400:
 *         description: Validation error
 */
router.post('/', authorize('ADMIN'), validateCreateWard, validate, wardsController.createWard);

/**
 * @swagger
 * /wards:
 *   get:
 *     summary: Get all wards
 *     tags: [Wards]
 *     responses:
 *       200:
 *         description: List of wards
 */
router.get('/', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), wardsController.getWards);

/**
 * @swagger
 * /wards/{id}:
 *   get:
 *     summary: Get ward by ID
 *     tags: [Wards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ward object
 *       404:
 *         description: Ward not found
 */
router.get('/:id', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), wardsController.getWardById);

/**
 * @swagger
 * /wards/{id}/rooms:
 *   post:
 *     summary: Add a room to a ward
 *     tags: [Wards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ward ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roomNumber]
 *             properties:
 *               roomNumber:
 *                 type: string
 *                 example: "101"
 *     responses:
 *       201:
 *         description: Room added
 *       404:
 *         description: Ward not found
 */
router.post('/:id/rooms', authorize('ADMIN'), validateCreateRoom, validate, wardsController.createRoom);

/**
 * @swagger
 * /wards/{id}/rooms:
 *   get:
 *     summary: Get all rooms in a ward
 *     tags: [Wards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rooms list
 */
router.get('/:id/rooms', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), wardsController.getRoomsByWard);

/**
 * @swagger
 * /wards/{id}/beds:
 *   post:
 *     summary: Add a bed to a ward
 *     tags: [Wards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bedNumber]
 *             properties:
 *               bedNumber:
 *                 type: string
 *                 example: "B-01"
 *     responses:
 *       201:
 *         description: Bed added
 */
router.post('/:id/beds', authorize('ADMIN'), validateCreateBed, validate, wardsController.createBed);

/**
 * @swagger
 * /wards/{id}/beds:
 *   get:
 *     summary: Get all beds in a ward
 *     tags: [Wards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Beds list with status (available/occupied/maintenance)
 */
router.get('/:id/beds', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), wardsController.getBedsByWard);

/**
 * @swagger
 * /wards/{wardId}/beds/{bedId}/status:
 *   patch:
 *     summary: Update bed status
 *     tags: [Wards]
 *     parameters:
 *       - in: path
 *         name: wardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: bedId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, occupied, maintenance]
 *     responses:
 *       200:
 *         description: Bed status updated
 *       409:
 *         description: Bed is not available (thrown on admission if occupied)
 */
router.patch(
  '/:wardId/beds/:bedId/status',
  authorize('ADMIN', 'NURSE'),
  validateUpdateBedStatus, validate,
  wardsController.updateBedStatus
);

export default router;
