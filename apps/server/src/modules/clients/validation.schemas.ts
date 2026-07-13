import * as yup from "yup";



const nonEmptyArray = yup.array().of(yup.string().required()).min(1);


// entirely optional, but if any option is provided, must include at least one item
const patchStringArray = yup.object({
  add: yup.array().of(yup.string().required()).min(1).optional(),
  remove: yup.array().of(yup.string().required()).min(1).optional(),
});


// entirely optional or entirely available
const patchBool = yup.object({
  incoming: yup.boolean().required(),
  current: yup.boolean().required().notOneOf([yup.ref('incoming')], 'is_public_diff current and incoming states must be different'),
}).default(undefined);


export const getClientSchema = {
  params: yup.object({ id: yup.string().required(), }),
};


export const registerClientSchema = {
  body: yup.object({
    name: yup.string().required(),
    logo_url: yup.string().nullable(),
    redirect_uris: nonEmptyArray.required(),
    allowed_grants: nonEmptyArray,
    allowed_scopes: nonEmptyArray,
    is_public: yup.boolean().required(),
  }),
};


export const updateClientSchema = {
  body: yup.object({
    name: yup.string().required(),
    logo_url: yup.string().nullable(),
    redirect_uris_diff: patchStringArray.optional(),
    allowed_grants_diff: patchStringArray.optional(),
    allowed_scopes_diff: patchStringArray.optional(),
    is_public_diff: patchBool.optional(),
  }),
};