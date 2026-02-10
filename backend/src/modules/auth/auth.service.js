import { User } from "../model/user.model.js";

class AuthService {
  async signup(userData) {
    try {
      let existingUser = await User.findOne({
        $or: [{ email: userData.email }, { phone: userData.phone }],
      });
      if (existingUser) {
        throw new Error("User with this email or phone already exists");
      }

      let newUser = await User.create(userData);

      const token = newUser.generateAuthToken();

      return {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
      try {
          const user = await User.findOne({email}).select('+password')
  
          if(!user){
              throw new Error('Invalid email');
          }
  
          const isValidPassword = await user.comparePassword(password);
  
          if(!isValidPassword){
              throw new Error('Invalid password');
          }
          if(!user.isActive){
              throw new Error('Account is deactivated. Please contact support.');
          }
          const token = await user.generateAuthToken();
  
          return {
              user: {
                  id: user._id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  isActive: user.isActive,
                  createdAt: user.createdAt,
              },
              token,
          }
      } catch (error) {
          throw error;
      }
  }
}



export const authService = new AuthService();
