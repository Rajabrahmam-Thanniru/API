import * as yup from 'yup';

export const signUp_Shema = yup.object().shape({
  fName: yup
    .string()
    .matches(/^[A-Za-z]+$/, "First name should contain only letters")
    .required("First name is required"),

  lName: yup
    .string()
    .matches(/^[A-Za-z]+$/, "Last name should contain only letters")
    .required("Last name is required"),

  email: yup
    .string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      "Invalid email format"
    )
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .required("Password is required"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),

  dob: yup
    .date()
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Date of birth is required"),
});

export const PoststudentSchema = yup.object().shape({
  hallTicket: yup
    .string()
    .matches(/^2103A[1-4]\d{5}$/, "Invalid hall ticket format (e.g., 2103A112345)")
    .required("Hall ticket is required"),
  
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  gpa: yup
    .number()
    .min(0, "GPA must be at least 0")
    .max(10, "GPA must not exceed 10")
    .required("GPA is required"),
});

