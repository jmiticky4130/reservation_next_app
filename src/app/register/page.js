import RegisterForm from "@/app/components/register-form";
import HomeButton from "@/app/components/HomeButton";

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const role = params?.role || "customer"; // Default to "customer"

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <HomeButton />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          Create an Account
        </h1>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <RegisterForm role={role} />
        </div>
      </div>
    </main>
  );
}
