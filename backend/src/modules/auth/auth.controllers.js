import { authService } from "./auth.service.js";

async function signup(req, res) {
  try {
    const userData = req.body;
    const result = await authService.signup(userData);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to signup user",
    });
  }
}

async function login(req, res){
    try {
        let {email, phone, password} = req.body;
        let identifier = email || phone;

        const result = await authService.login(identifier, password);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to login user",
        });
    }
}
 export { signup, login };