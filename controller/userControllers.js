import userModel from "../models/userModel.js";

export const editUsername = async (req, res) => {
  const userId = req.user.userId;
  const { newUserName } = req.body;
  try {
    const user = await userModel.updateOne(
      { _id: userId },
      { $set: { userName: newUserName } }, {new:true}
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Username updated successfully", user });
  } catch (error) {
    console.error("Error updating username:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating username" });
  }
};


export const changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { newPassword, currentPassword } = req.body;
  try {

    const user = await userModel.findOne({ _id:userId });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword, salt);

    const userN = await userModel.updateOne(
      { _id: userId },
      { $set: { password: hash } }, {new:true}
    );

    if (!userN) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating password" });
  }
};

export const getProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      consumerId: user.consumerId,
      productId: user.productId,
    };

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching profile" });
  }
};
