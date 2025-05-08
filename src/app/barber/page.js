import { fetchAppointmentSlots } from "@/app/lib/data";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Calendar from "@/app/components/calendar";
import { getWeekDates } from "@/app/util/formatFunctions";
import { fetchBarberById } from "@/app/lib/data";


export default async function BarberPage(props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const barberId = session.user.id;
  const barberName = await fetchBarberById(barberId);
  console.log("Barber Name:", barberName);
  const searchParams = await props.searchParams;
  const dateParam = searchParams?.date ?? null;
  const startDate = dateParam ? new Date(dateParam) : new Date();

  const weekDates = getWeekDates(startDate);
  const appointmentSlots = await fetchAppointmentSlots(barberId, startDate);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Welcome {barberName.name} !</h1>
      <Calendar
        initialWeekDates={weekDates}
        initialAppointmentSlots={appointmentSlots}
        barberId={barberId}
      />
      
    </>
  );
}
