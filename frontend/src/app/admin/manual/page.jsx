'use client';

import React from 'react';
import { FaTachometerAlt, FaCalendarCheck, FaBed, FaUsers, FaQuestionCircle, FaInfoCircle, FaBookOpen } from 'react-icons/fa';

export default function ManualInstruccionesPage() {
  return (
    <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg border border-gray-200">

        <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
          <FaBookOpen className="text-4xl text-[var(--color-primary)] mr-4" />
          <h1 className="text-3xl font-bold text-gray-800">Manual de Instrucciones - Panel de Administración</h1>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaInfoCircle className="mr-3 text-[var(--color-secondary)]" />
            Bienvenido/a al Panel de Administración
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Este panel te permite gestionar las operaciones clave de la Hacienda San Carlos. Aquí puedes ver y administrar las reservas de eventos, las reservas de hotel y los usuarios registrados.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Utiliza el menú de la izquierda para navegar entre las diferentes secciones.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaTachometerAlt className="mr-3 text-[var(--color-secondary)]" />
            Dashboard (Inicio)
          </h2>
          <p className="text-gray-600 leading-relaxed">
            El Dashboard (si está implementado) te ofrece una vista general rápida de las estadísticas importantes, como nuevas reservas, ocupación, etc.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaCalendarCheck className="mr-3 text-[var(--color-secondary)]" />
            Gestión de Reservas de Eventos
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            En la sección "Reservas Eventos", puedes ver todas las solicitudes y reservas confirmadas para eventos (bodas, corporativos, etc.).
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 pl-4">
            <li>Puedes filtrar las reservas por estado (Pendiente, Confirmada, Cancelada).</li>
            <li>Las reservas \"Sin Asignar\" están disponibles para que cualquier administrador las gestione.</li>
            <li>Para gestionar una reserva, primero debes hacer clic en \"Asignar a mi cuenta\". Una vez asignada, solo tú podrás modificarla.</li>
            <li>Haz clic en \"Ver Detalles\" para revisar toda la información de una reserva (cliente, fechas, servicios, pagos, etc.) y realizar acciones.</li>
            <li>Puedes \"Confirmar\", \"Cancelar\" o marcar como \"Pendiente\" una reserva desde el menú de acciones (icono de tres puntos).</li>
            <li>Para \"liberar\" una reserva y que otro administrador pueda gestionarla, usa la opción \"Desasignar de mi cuenta\".</li>
            <li>La opción \"Eliminar Reserva\" borra permanentemente la reserva. ¡Úsala con cuidado! Se te pedirá confirmación.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaBed className="mr-3 text-[var(--color-secondary)]" />
            Gestión de Reservas de Hotel
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Esta sección funciona de manera muy similar a la de eventos, pero para las reservas de habitaciones de hotel individuales.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 pl-4">
            <li>Visualiza todas las reservas de habitaciones.</li>
            <li>Filtra por fechas, estado o busca por número de confirmación.</li>
            <li>Asigna/Desasigna reservas a tu cuenta para gestionarlas.</li>
            <li>Accede a los detalles para ver información del huésped, fechas, habitación, precio y pagos.</li>
            <li>Confirma, cancela o elimina reservas usando el menú de acciones y el modal de confirmación.</li>
          </ul>
        </section>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaUsers className="mr-3 text-[var(--color-secondary)]" />
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Aquí puedes ver la lista de usuarios registrados en la plataforma.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 pl-4">
            <li>Busca usuarios por nombre o correo electrónico.</li>
            <li>Puedes ver si una cuenta está activa o pendiente de aprobación.</li>
            <li>Activa o desactiva cuentas de usuario según sea necesario.</li>
            <li>Puedes cambiar el rol de un usuario (por ejemplo, de Cliente a Administrador). Ten mucho cuidado al asignar roles de administrador.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaQuestionCircle className="mr-3 text-[var(--color-secondary)]" />
            ¿Necesitas Ayuda?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Si tienes alguna duda sobre el funcionamiento del panel o encuentras algún problema, por favor, contacta con el soporte técnico o el responsable del desarrollo.
          </p>
        </section>

      </div>
    </div>
  );
}