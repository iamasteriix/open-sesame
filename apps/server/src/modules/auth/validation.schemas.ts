import * as yup from "yup";
import { findUserByEmail, findUserByUsername } from "../users/user.service.js";



const identifierSchema = yup
  .object({
    username: yup.string().optional(),
    email: yup.string().email().optional(),
  })
  .test(
    'username-or-email',
    'either username or email is required',
    value => !!(value?.username || value?.email)
  );


export const signinSchema = {
  body: yup.object({
    identifier: identifierSchema.required(),
  }),
};


export const getVerifySigninSchema = {
  query: yup.object({ token: yup.string().required(), }),
};


export const submitVerifySigninSchema = {
  body: yup.object({
    code: yup.string().required(),
    mfa_token: yup.string().required(),
  }),
};


export const signupSchema = {
  body: yup.object({
    username: yup.string()
      .required()
      .test(
        'is-unique-username',
        'username is already taken',
        async value => {
          if (!value) return true;                      // let required handle empty values
          const user = await findUserByUsername(value);
          return !user;                                 // return true if no user
        }
      ),
    email: yup.string()
      .email()
      .required()
      .test(
        'is-unique-email',
        'email is already registered',
        async value => {
          if (!value) return true;
          const user = await findUserByEmail(value);
          return !user;
        }
      ),
  }),
};


export const refreshTokenSchema = {
  body: yup.object({ refresh_token: yup.string().required(), }),
};
