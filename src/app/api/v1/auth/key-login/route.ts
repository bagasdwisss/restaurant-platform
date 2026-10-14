import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Autentikasi via Unique Key telah dinonaktifkan demi keamanan. Harap gunakan autentikasi kredensial (Username/Email & Password) dengan Role-Based Access Control.",
    },
    { status: 410 }
  );
}
