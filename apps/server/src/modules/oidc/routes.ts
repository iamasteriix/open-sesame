import type { Request, Response, NextFunction } from "express";
import { createOidcProvider } from "../../lib/oidc/oidcProvider.js";
import { Router } from "express";


const oidcRouter = Router();


oidcRouter.use('/', async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const provider = await createOidcProvider();
      const handler = provider.callback();
      return handler(request, response);
    } catch (error) {
      next(error);
    }
  }
);


export default oidcRouter;