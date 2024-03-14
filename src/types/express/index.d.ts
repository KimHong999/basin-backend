declare namespace Express {
  interface Request {
    parameters: any;
    auth_token?: string | undefined;
    currentUser?: any;
    decoded?: any;
    __?: any;
  }
}
