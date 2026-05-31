// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // আপনার ফাইল পাথ অনুযায়ী ঠিক আছে

const handler = (NextAuth as any)(authOptions);

// Next.js App Router-এর জন্য GET এবং POST এক্সপোর্ট করতে হবে
export { handler as GET, handler as POST };