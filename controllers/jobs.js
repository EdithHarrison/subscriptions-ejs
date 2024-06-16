const Job = require("../models/Job");
const parseVErr = require("../util/parseValidationErr");
const csrf = require("host-csrf");

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id });
    const token = csrf.token(req, res);
    res.render("jobs", { jobs, _csrf: token });
  } catch (error) {
    req.flash("error", "Unable to fetch jobs");
    res.redirect("/");
  }
};

const createJob = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    await Job.create(req.body);
    req.flash("info", "Job created successfully");
    res.redirect("/jobs");
  } catch (error) {
    if (error.constructor.name === "ValidationError") {
      parseVErr(error, req);
      const token = csrf.token(req, res);
      res.render("job", { job: null, errors: req.flash("error"), _csrf: token });
    } else {
      req.flash("error", "Error creating job");
      res.redirect("/jobs");
    }
  }
};

const getJobForm = (req, res) => {
  const token = csrf.token(req, res);
  res.render("job", { job: null, _csrf: token });
};

const editJobForm = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!job) {
      req.flash("error", "Job not found");
      return res.redirect("/jobs");
    }
    const token = csrf.token(req, res);
    res.render("job", { job, _csrf: token });
  } catch (error) {
    req.flash("error", "Error fetching job");
    res.redirect("/jobs");
  }
};

const updateJob = async (req, res) => {
  try {
    await Job.updateOne({ _id: req.params.id, createdBy: req.user._id }, req.body);
    req.flash("info", "Job updated successfully");
    res.redirect("/jobs");
  } catch (error) {
    if (error.constructor.name === "ValidationError") {
      parseVErr(error, req);
      const token = csrf.token(req, res);
      res.render("job", { job: req.body, errors: req.flash("error"), _csrf: token });
    } else {
      req.flash("error", "Error updating job");
      res.redirect("/jobs");
    }
  }
};

const deleteJob = async (req, res) => {
  try {
    await Job.deleteOne({ _id: req.params.id, createdBy: req.user._id });
    req.flash("info", "Job deleted successfully");
    res.redirect("/jobs");
  } catch (error) {
    req.flash("error", "Error deleting job");
    res.redirect("/jobs");
  }
};

module.exports = {
  getJobs,
  createJob,
  getJobForm,
  editJobForm,
  updateJob,
  deleteJob,
};
