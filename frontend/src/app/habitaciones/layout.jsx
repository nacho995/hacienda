import { Metadata } from 'next';

export const metadata = {
  title: 'Hotel Hacienda San Carlos | Experiencia hotelera de lujo',
  description: 'Disfrute de nuestras lujosas habitaciones en Hotel Hacienda San Carlos, ya sea como complemento a su evento o como experiencia hotelera independiente.',
  keywords: 'hotel, hacienda, lujo, habitaciones, reservación, eventos, estancia',
};

export default function HotelLayout({ children }) {
  return (
    <>
      {children}
    </>
  );
}