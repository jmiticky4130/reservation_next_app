import {getUsers} from '@/app/lib/data';

export default async function Home() {
  const reservations = await getUsers();
  return (
    <ul>
        {reservations.map((reservation) => (
          <li key={reservation.id}>
            {reservation.name} - {new Date(reservation.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
  );
}
