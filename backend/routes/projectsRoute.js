// const router = require("express").Router();
// const Project = require("../models/projectModel");
// const authMiddleware = require("../middlewares/authMiddleware");
// const User = require("../models/userModel");

// router.post("/create-project", authMiddleware, async (req, res) => {
//   try {
//     const newProject = new Project({
//       ...req.body,
//       owner: req.userId, // Always set owner from the authenticated user
//     });
//     await newProject.save();
//     res.status(201).send({
//       success: true,
//       data: newProject,
//       message: "Project created successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/get-all-projects", authMiddleware, async (req, res) => {
//   try {
//     const projects = await Project.find({
//       owner: req.userId,
//     }).sort({ createdAt: -1 })
//       .populate("owner");
//     res.status(200).send({
//       success: true,
//       data: projects,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/get-project-by-id", authMiddleware, async (req, res) => {
//   try {
//     const project = await Project.findById(req.body._id)
//       .populate("owner")
//       .populate("members.user");
//     res.status(200).send({
//       success: true,
//       data: project,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/get-projects-by-role", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.userId;
//     const projects = await Project.find({ "members.user": userId })
//       .sort({
//         createdAt: -1,
//       })
//       .populate("owner");
//     res.status(200).send({
//       success: true,
//       data: projects,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/edit-project", authMiddleware, async (req, res) => {
//   try {
//     const updatedProject = await Project.findByIdAndUpdate(
//       req.body._id,
//       req.body,
//       { new: true }
//     );
//     res.status(200).send({
//       success: true,
//       data: updatedProject,
//       message: "Project updated successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/delete-project", authMiddleware, async (req, res) => {
//   try {
//     await Project.findByIdAndDelete(req.body._id);
//     res.status(200).send({
//       success: true,
//       message: "Project deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/add-member", authMiddleware, async (req, res) => {
//   try {
//     const { email, role, projectId } = req.body;

//     if (!email || !role || !projectId) {
//       return res.status(400).send({
//         success: false,
//         message: "Email, role, and projectId are required",
//       });
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).send({
//         success: false,
//         message: "User not found",
//       });
//     }
//     await Project.findByIdAndUpdate(projectId, {
//       $push: {
//         members: {
//           user: user._id,
//           role,
//         },
//       },
//     });

//     res.status(201).send({
//       success: true,
//       message: "Member added successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/remove-member", authMiddleware, async (req, res) => {
//   try {
//     const { memberId, projectId } = req.body;

//     if (!memberId || !projectId) {
//       return res.status(400).send({
//         success: false,
//         message: "memberId and projectId are required",
//       });
//     }

//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).send({
//         success: false,
//         message: "Project not found",
//       });
//     }

//     project.members = project.members.filter(
//       (m) => m.user.toString() !== memberId
//     );
//     await project.save();

//     res.status(200).send({
//       success: true,
//       message: "Member removed successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// module.exports = router;

const router = require("express").Router();
const Project = require("../models/projectModel");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/userModel");

// Create Project
router.post("/create-project", authMiddleware, async (req, res) => {
  try {
    const newProject = new Project({
      ...req.body,
      owner: req.userId,
    });
    await newProject.save();

    // 🔔 Emit event to project owner
    const io = req.app.get("io");
    io.to(req.userId.toString()).emit("project-created", newProject);

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

// Get All Projects Owned by User
router.post("/get-all-projects", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.userId,
    })
      .sort({ createdAt: -1 })
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

// Get Specific Project by ID
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

// Get Projects Where User is a Member
router.post("/get-projects-by-role", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ "members.user": req.userId })
      .sort({ createdAt: -1 })
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

// Edit Project
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

// Delete Project
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

// Add Member to Project
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

    // 🔔 Notify the added user in real-time
    const io = req.app.get("io");
    io.to(user._id.toString()).emit("added-to-project", {
      projectId,
      role,
      addedBy: req.userId,
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

// Remove Member from Project
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
