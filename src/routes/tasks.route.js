import Router from 'express';
import { getAllTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/tasks.controller.js';

const router = Router();

router.route('/').get(getAllTasks).post(createTask);
router.route('/:id').get(getTask).delete(deleteTask).patch(updateTask);

export default router;