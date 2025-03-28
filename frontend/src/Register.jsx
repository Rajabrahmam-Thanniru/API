import "./index.css";
import { useFormik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { signUp_Shema } from "./schema";
import "./Register.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const nav = useNavigate();
  const { values, handleChange, handleBlur, handleSubmit, errors, touched } =
    useFormik({
      initialValues: {
        fName: "",
        lName: "",
        email: "",
        dob: "",
        password: "",
        confirmPassword: "",
      },
      validationSchema: signUp_Shema,
      validateOnBlur: true,
      validateOnChange: false,
      onSubmit: async (values, { resetForm }) => {
        console.log(values);
        try {
          const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          const data = await response.json();

          if (response.ok) {
            alert("User registered successfully!");
            nav("/login");
            resetForm();
          } else {
            alert(`Error: ${data.message}`);
          }
        } catch (error) {
          console.error("Registration error:", error);
        }
      },
    });
  return (
    <div className="w-[50%] h-auto bg-amber-100 justify-self-center p-4 mt-[5rem]">
      <h1 className="text-center text-xl font-bold">Register</h1>
      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        className="flex flex-col space-y-3"
      >
        {/* First Name */}
        <div className="flex flex-col">
          <label>First Name</label>
          <input
            id="fName"
            type="text"
            placeholder="Enter First Name"
            className="input_field"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.fName}
          />
          {errors.fName && touched.fName && (
            <p className="error-text">{errors.fName}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col">
          <label>Last Name</label>
          <input
            id="lName"
            type="text"
            placeholder="Enter Last Name"
            className="input_field"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.lName}
          />
          {errors.lName && touched.lName && (
            <p className="error-text">{errors.lName}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label>Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your Email"
            className="input_field"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />
          {errors.email && touched.email && (
            <p className="error-text">{errors.email}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col">
          <label>Date of Birth</label>
          <input
            id="dob"
            type="date"
            className="input_field"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.dob}
          />
          {errors.dob && touched.dob && (
            <p className="error-text">{errors.dob}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col relative">
          <label>Password</label>
          <div className="passwordF flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-[25em] p-2 outline-none border-none"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && touched.password && (
            <p className="error-text">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col relative">
          <label>Confirm Password</label>
          <div className="passwordF flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="w-[25em] p-2 outline-none border-none"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="error-text">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Register;
