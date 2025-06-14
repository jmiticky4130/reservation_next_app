
import { fetchAppointmentSlots } from "@/app/lib/data";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Calendar from "@/app/components/calendar";
import { getWeekDates } from "@/app/util/formatFunctions";
import { fetchBarberById } from "@/app/lib/data";
import LogoutButton from "@/app/components/LogoutButton";

export default async function BarberPage(props) {
  const session = await auth();
  if (!session?.user) redirect("/login?role=barber");

  const barberId = session.user.id;
  const barberName = await fetchBarberById(barberId);
  const searchParams = await props.searchParams;
  const dateParam = searchParams?.date ?? null;
  const startDate = dateParam ? new Date(dateParam) : new Date();

  const weekDates = getWeekDates(startDate);
  const appointmentSlots = await fetchAppointmentSlots(barberId, startDate);

  return (
    <>
      <div className="flex justify-between items-center mb-6 p-4 bg-white shadow-sm rounded-lg">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {barberName.name}!
          </h1>
          <p className="text-gray-600">Manage your appointments</p>
        </div>
        
        <LogoutButton />
      </div>

      <Calendar
        initialWeekDates={weekDates}
        initialAppointmentSlots={appointmentSlots}
        barberId={barberId}
      />
    </>
  );
}
