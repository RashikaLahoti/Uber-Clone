import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const ROLES = ["RIDER", "DRIVER"];

export default function SignUp({ setToggle }) {
  const [role, setRole] = useState("RIDER");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    try {
      setServerError("");

      const response = await axios.post(
        "http://localhost:3000/api/auth/signup", // change to your route
        {
          ...data,
          role,
        }
      );

      console.log(response.data);

      // Optional: store token
      localStorage.setItem("token", response.data.token);

      navigate("/home"); // redirect to home or login page
    } catch (error) {
      console.error(error);

      if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Welcome to Uber!</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 bg-zinc-900 p-8 rounded-2xl border border-zinc-800"
      >
        <h2 className="text-2xl font-bold">Create Account</h2>

        {/* Name */}
        <div>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700"
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "At least 2 characters",
              },
              maxLength: {
                value: 50,
                message: "Max 50 characters",
              },
            })}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9+\-\s()]{7,15}$/,
                message: "Invalid phone number",
              },
            })}
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Minimum 6 characters",
              },
            })}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-zinc-400"
          >
            {showPassword ? "Hide" : "Show"}
          </button>

          {errors.password && (
            <p className="text-red-400 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Role Toggle */}
        <div className="flex gap-3 pt-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-xl border ${
                role === r
                  ? "bg-white text-black"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Server Error */}
        {serverError && (
          <p className="text-red-500 text-sm text-center">
            {serverError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-black py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create Account"}
        </button>

        {/* Toggle to Login */}
        <div className="text-center pt-4 border-t border-zinc-700">
          <p className="text-zinc-400 text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setToggle(true)}
              className="text-white font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
