const router = require("express").Router();
const Project = require("../models/projectModel");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/userModel");

router.post("/create-project", authMiddleware, async (req, res) => {
  try {
    const newProject = new Project({
      ...req.body,
      owner: req.userId, // Always set owner from the authenticated user
    });
    await newProject.save();
    res.status(201).send({
      success: true,
      data: newProject,
      message: "Project created successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/get-all-projects", authMiddleware, async (req, res) => {
    try {
        // Remove any filters set to "all"
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] === "all") {
                delete req.body[key];
            }
        });

        const projects = await Project.find(req.body);
        res.status(200).send({
            success: true,
            data: projects,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }
});

router.post("/get-project-by-id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.body._id)
      .populate("owner")
      .populate("members.user");
    res.status(200).send({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/get-projects-by-role", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const projects = await Project.find({ "members.user": userId })
      .sort({
        createdAt: -1,
      })
      .populate("owner");
    res.status(200).send({
      success: true,
      data: projects,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/edit-project", authMiddleware, async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.body._id,
      req.body,
      { new: true }
    );
    res.status(200).send({
      success: true,
      data: updatedProject,
      message: "Project updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/delete-project", authMiddleware, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.body._id);
    res.status(200).send({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/add-member", authMiddleware, async (req, res) => {
  try {
    const { email, role, projectId } = req.body;

    if (!email || !role || !projectId) {
      return res.status(400).send({
        success: false,
        message: "Email, role, and projectId are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    await Project.findByIdAndUpdate(projectId, {
      $push: {
        members: {
          user: user._id,
          role,
        },
      },
    });

    res.status(201).send({
      success: true,
      message: "Member added successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/remove-member", authMiddleware, async (req, res) => {
  try {
    const { memberId, projectId } = req.body;

    if (!memberId || !projectId) {
      return res.status(400).send({
        success: false,
        message: "memberId and projectId are required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== memberId
    );
    await project.save();

    res.status(200).send({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
