// const router = require("express").Router();

// const Task = require("../models/taskModel");
// const Project = require("../models/projectModel");
// const User = require("../models/userModel");
// const authMiddleware = require("../middlewares/authMiddleware");
// const cloudinary = require("../config/cloudinaryConfig");
// const multer = require("multer");

// router.post("/create-task", authMiddleware, async (req, res) => {
//   try {
//     const newTask = new Task(req.body);
//     await newTask.save();
//     res.status(201).send({
//       success: true,
//       message: "Task created successfully",
//       data: newTask,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/get-all-tasks", authMiddleware, async (req, res) => {
//   try {
//     Object.keys(req.body).forEach((key) => {
//       if (req.body[key] === "all") {
//         delete req.body[key];
//       }
//     });
//     delete req.body["userId"];
//     const tasks = await Task.find(req.body)
//       .populate("assignedTo")
//       .populate("assignedBy")
//       .populate("project")
//       .sort({ createdAt: -1 });
//     res.status(200).send({
//       success: true,
//       message: "Tasks fetched successfully",
//       data: tasks,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/update-task", authMiddleware, async (req, res) => {
//   try {
//     await Task.findByIdAndUpdate(req.body._id, req.body);
//     res.status(200).send({
//       success: true,
//       message: "Task updated successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/delete-task", authMiddleware, async (req, res) => {
//   try {
//     await Task.findByIdAndDelete(req.body._id);
//     res.status(200).send({
//       success: true,
//       message: "Task deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// const storage = multer.diskStorage({
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + file.originalname);
//   },
// });

// const fs = require("fs");

// router.post(
//   "/upload-image",
//   authMiddleware,
//   multer({ storage: storage }).single("file"),
//   async (req, res) => {
//     try {
//       const result = await cloudinary.uploader.upload(req.file.path, {
//         folder: "tasks",
//       });
//       const imageURL = result.secure_url;

//       // Remove local file after upload
//       fs.unlinkSync(req.file.path);

//       await Task.findOneAndUpdate(
//         { _id: req.body.taskId },
//         {
//           $push: {
//             attachments: imageURL,
//           },
//         }
//       );

//       res.status(201).send({
//         success: true,
//         message: "Image uploaded successfully",
//         data: imageURL,
//       });
//     } catch (error) {
//       res.status(500).send({
//         success: false,
//         message: error.message,
//       });
//     }
//   }
// );

// module.exports = router;

const router = require("express").Router();
const Task = require("../models/taskModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel");
const authMiddleware = require("../middlewares/authMiddleware");
const cloudinary = require("../config/cloudinaryConfig");
const multer = require("multer");
const fs = require("fs");

// 📌 Storage config for multer
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

// ✅ Create Task — emits "task-created" to assigned user
router.post("/create-task", authMiddleware, async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();

    const io = req.app.get("io");
    io.to(newTask.assignedTo.toString()).emit("task-created", newTask);

    res.status(201).send({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Fetch Tasks (with filters)
router.post("/get-all-tasks", authMiddleware, async (req, res) => {
  try {
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === "all") {
        delete req.body[key];
      }
    });
    delete req.body["userId"];

    const tasks = await Task.find(req.body)
      .populate("assignedTo")
      .populate("assignedBy")
      .populate("project")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Update Task — emits "task-updated" to assigned user
router.post("/update-task", authMiddleware, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.body._id, req.body, {
      new: true,
    });

    const io = req.app.get("io");
    io.to(updatedTask.assignedTo.toString()).emit("task-updated", updatedTask);

    res.status(200).send({
      success: true,
      message: "Task updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Delete Task — optionally emit if needed
router.post("/delete-task", authMiddleware, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.body._id);
    res.status(200).send({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Upload Attachment Image
router.post(
  "/upload-image",
  authMiddleware,
  multer({ storage: storage }).single("file"),
  async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "tasks",
      });

      const imageURL = result.secure_url;
      fs.unlinkSync(req.file.path);

      await Task.findOneAndUpdate(
        { _id: req.body.taskId },
        {
          $push: { attachments: imageURL },
        }
      );

      res.status(201).send({
        success: true,
        message: "Image uploaded successfully",
        data: imageURL,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;