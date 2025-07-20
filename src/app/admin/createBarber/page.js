import CreateBarberForm from "@/app/components/CreateBarberForm";

export default function CreateBarberPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-200">Create New Barber</h1>
            <p className="text-gray-400 mt-2">
              Add a new barber to your team. They&apos;ll be able to log in and manage their own schedule.
            </p>
          </div>
        </div>
      </div>

      <CreateBarberForm />

      <div className="mt-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">What happens after creating a barber?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Barber Access</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Can log in to their barber dashboard</li>
              <li>• Manage their own schedule and availability</li>
              <li>• View their appointments</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Security & Permissions</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• No admin privileges by default</li>
              <li>• Cannot access admin functions</li>
              <li>• Limited to their own data only</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}