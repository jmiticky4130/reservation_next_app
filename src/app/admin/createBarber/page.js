import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateBarberForm from "@/app/components/CreateBarberForm";
import { getAllServices } from "@/app/lib/data";

export default async function CreateBarberPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  // Fetch all available services
  const services = await getAllServices();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-200">Create New Barber</h1>
        <p className="text-gray-400 mt-2">
          Add a new barber to your team with their service assignments
        </p>
      </div>

      <CreateBarberForm services={services} />
    </div>
  );
}