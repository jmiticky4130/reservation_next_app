import AppointmentForm from '@/app/components/AppointmentForm';

import { fetchAppointmentSlots } from '@/app/lib/data';
 
export default async function Page() {
  const appointments = await fetchAppointmentSlots();
 
  return (
    <main>
    <AppointmentForm appointmentSlots={appointments} />
    </main>
  );
}