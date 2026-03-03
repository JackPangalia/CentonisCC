/* This file handles authentication actions and user profile records. */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AppUser } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export async function signUpWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const userDocRef = doc(db, "users", result.user.uid);
  const existing = await getDoc(userDocRef);

  if (!existing.exists()) {
    const appUser: AppUser = {
      id: result.user.uid,
      email,
      emailLower: email.toLowerCase(),
      createdAt: nowIso(),
    };
    await setDoc(userDocRef, appUser);
  }
}

export async function loginWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  
  const userDocRef = doc(db, "users", result.user.uid);
  const existing = await getDoc(userDocRef);

  if (!existing.exists() && result.user.email) {
    const appUser: AppUser = {
      id: result.user.uid,
      email: result.user.email,
      emailLower: result.user.email.toLowerCase(),
      createdAt: nowIso(),
    };
    await setDoc(userDocRef, appUser);
  }
  
  return result.user;
}

export async function logout() {
  await signOut(auth);
}
