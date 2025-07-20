import { fetchAppointmentSlots } from "@/app/lib/data";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Calendar from "@/app/components/calendar";
import { getWeekDates } from "@/app/util/formatFunctions";


export default async function BarberPage(props) {
  const session = await auth();

  if (session?.user.role !== "barber") redirect("/login?role=barber");

  const barberId = session.user.id;
  const searchParams = await props.searchParams;
  const dateParam = searchParams?.date ?? null;
  const startDate = dateParam ? new Date(dateParam) : new Date();
  const weekDates = getWeekDates(startDate);
  const appointmentSlots = await fetchAppointmentSlots(barberId, startDate);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <Calendar
        initialWeekDates={weekDates}
        initialAppointmentSlots={appointmentSlots}
        barberId={barberId}
      />
    </div>
  );
}