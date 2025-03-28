'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
 
const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });

export async function createReservation(formData){
    const rawFormData ={
        appointment_slot_id: Number(formData.get('appointmentId')),
        customerId: 4
    }

    const created_at = new Date().toISOString().split('T')[0];
 
    try {
        // Use a transaction to ensure both operations succeed or fail together
        await sql.begin(async (sql) => {
            // 1. Insert the reservation and get the new ID
            const newReservation = await sql`
                INSERT INTO reservations (customer_id, appointment_slot_id, created_at)
                VALUES (${rawFormData.customerId}, ${rawFormData.appointment_slot_id}, ${created_at})
                RETURNING id
            `;
            
            const reservationId = newReservation[0].id;
            
            // 2. Update the appointment_slots table 
            await sql`
                UPDATE appointment_slots 
                SET reservation_id = ${reservationId},
                    is_available = false
                WHERE id = ${rawFormData.appointment_slot_id}
            `;            
        });
        console.log("Transaction completed successfully");
        // If we get here, both operations succeeded
        
    } catch (error) {
        // Handle errors
        console.error('Error creating reservation:', error);
        throw new Error('Failed to create reservation');
    }
    revalidatePath('/reservations');
    redirect('/reservations');

}