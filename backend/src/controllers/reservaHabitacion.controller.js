console.log(`>>> [Habitación] Intentando enviar confirmación a cliente: ${reserva.email}`);
await enviarConfirmacionReservaHabitacion({
  email: reserva.email,
  // ... otros datos ...
});

if (adminEmails) {
  console.log(`>>> [Habitación] Intentando enviar notificación a admin: ${adminEmails}`);
  await sendEmail({
    email: adminEmails,
    subject: `Nueva Reserva de Habitación por ${reserva.nombreCliente}`,
    // ... html admin ...
  });
} 