import RegisterForm from '@/app/components/register-form';

export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
        <RegisterForm />
      </div>
    </main>
  );
}