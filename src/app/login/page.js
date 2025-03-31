import LoginForm from "@/app/components/login-form";
import { Suspense } from "react";

export default function LoginPage() {

    return (
        <main className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                <Suspense fallback={<div className="text-center">Loading...</div>}>
                <LoginForm />
                </Suspense>
            </div>
        </main>
    );
}