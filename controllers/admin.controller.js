import User from "../models/user.model.js";

// DashBoard
export const dashboard = async (req, res) => {
  console.log("Dashboard");

  const user = await User.findById(req.session.userId);
  res.render("dashboard", { title: "admin", user });
};
