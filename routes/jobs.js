const express = require("express");
const router = express.Router();
const { getJobs, createJob, getJobForm, editJobForm, updateJob, deleteJob } = require("../controllers/jobs");

router.route("/").get(getJobs).post(createJob);
router.route("/new").get(getJobForm);
router.route("/edit/:id").get(editJobForm);
router.route("/update/:id").post(updateJob);
router.route("/delete/:id").post(deleteJob);

module.exports = router;

