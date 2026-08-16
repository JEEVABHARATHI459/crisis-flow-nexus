/**
 * ============================================================
 *  CRISISMESH LOGIN CREDENTIALS  —  EDIT THIS FILE TO CHANGE
 * ============================================================
 *
 * HOW TO USE YOUR OWN EMAIL / PASSWORD:
 *   1. Change the values below (email must be lowercase).
 *   2. Save the file — the app reloads automatically.
 *   3. Sign in with your new email + password.
 *
 * You can add as many users as you like: just copy one block
 * and paste it inside the list, separated by a comma.
 */

export type AppUser = {
  email: string;
  password: string;
  name: string;
  role: string;
};

export const USERS: AppUser[] = [
  {
    email: "demo@crisismesh.ai",
    password: "demo123",
    name: "Operations Coordinator",
    role: "Emergency Response Team",
  },
  // {
  //   email: "you@gmail.com",
  //   password: "yourpassword",
  //   name: "Your Name",
  //   role: "Field Coordinator",
  // },
];

/** The account used by the "Run demo" / prefilled login button. */
export const DEMO_USER = USERS[0];

export function findUser(email: string, password: string) {
  const e = email.trim().toLowerCase();
  return USERS.find((u) => u.email.toLowerCase() === e && u.password === password) ?? null;
}
