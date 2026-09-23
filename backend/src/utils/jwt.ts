import jwt, { type SignOptions } from "jsonwebtoken";

export function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in the environment");

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };

  return jwt.sign({ sub: userId }, secret, options);
}

export function verifyToken(token: string): { sub: string } {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in the environment");

  return jwt.verify(token, secret) as { sub: string };
}