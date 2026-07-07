import * as Yup from "yup";

const regValidationSchema = Yup.object({
  fullName: Yup.string()
    .required("Required"),
  username: Yup.string()
    .min(3, "Must be at least 3 characters")
    .max(30, "Username too long")
    .matches(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
    .required("Required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Required"),
  password: Yup.string()
    .min(6, "Must be at least 6 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

export default regValidationSchema;
