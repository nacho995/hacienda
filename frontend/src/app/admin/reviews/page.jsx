"use client";

import ManageReviews from '../../../components/admin/ManageReviews';
// No necesitas importar AdminLayout aquí si ya está aplicado globalmente en admin/layout.jsx

export default function AdminResenasPage() {
  return (
    // El AdminLayout se aplicará automáticamente por la estructura de carpetas de Next.js
    <ManageReviews />
  );
} 