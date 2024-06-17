import express from 'express';
import { getJobs, createJob, getJobForm, editJobForm, updateJob, deleteJob } from '../controllers/jobs.js';

const router = express.Router();

router.route("/").get(getJobs).post(createJob);
router.route("/new").get(getJobForm);
router.route("/edit/:id").get(editJobForm);
router.route("/update/:id").post(updateJob);
router.route("/delete/:id").post(deleteJob);

export default router;
