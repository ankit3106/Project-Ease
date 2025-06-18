// const router = require("express").Router();
// const Notification = require("../models/notificationsModel");
// const authMiddleware = require("../middlewares/authMiddleware");

// router.post("/add-notification", authMiddleware, async (req, res) => {
//   try {
//     const newNotification = new Notification(req.body);
//     await newNotification.save();
//     res.send({
//       success: true,
//       data: newNotification,
//       message: "Notification added successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.get("/get-all-notifications", authMiddleware, async (req, res) => {
//   try {
//     const notifications = await Notification.find({
//       user: req.userId, 
//     }).sort({ createdAt: -1 });
//     res.send({
//       success: true,
//       data: notifications,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/mark-as-read", authMiddleware, async (req, res) => {
//   try {
//     await Notification.updateMany(
//       {
//         user: req.userId, 
//         read: false,
//       },
//       {
//         read: true,
//       }
//     );
//     const notifications = await Notification.find({
//       user: req.userId,
//     }).sort({ createdAt: -1 });
//     res.send({
//       success: true,
//       message: "Notifications marked as read",
//       data: notifications,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.delete("/delete-all-notifications", authMiddleware, async (req, res) => {
//   try {
//     await Notification.deleteMany({
//       user: req.userId, 
//     });
//     res.send({
//       success: true,
//       message: "All notifications deleted",
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
const Notification = require("../models/notificationsModel");
const authMiddleware = require("../middlewares/authMiddleware");

// Add Notification
router.post("/add-notification", authMiddleware, async (req, res) => {
  try {
    const newNotification = new Notification(req.body);
    await newNotification.save();

    // Emit real-time event to target user
    const io = req.app.get("io");
    io.to(req.body.user.toString()).emit("new-notification", newNotification);

    res.send({
      success: true,
      data: newNotification,
      message: "Notification added successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Get All Notifications
router.get("/get-all-notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.userId,
    }).sort({ createdAt: -1 });
    res.send({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Mark All as Read
router.post("/mark-as-read", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, read: false },
      { read: true }
    );
    const notifications = await Notification.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.send({
      success: true,
      message: "Notifications marked as read",
      data: notifications,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Delete All Notifications
router.delete("/delete-all-notifications", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({
      user: req.userId,
    });
    res.send({
      success: true,
      message: "All notifications deleted",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
