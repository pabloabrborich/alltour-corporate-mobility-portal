import { BookingClient } from "./booking-client";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  searchParams
}: {
  searchParams: Promise<{ reference?: string; demo?: string }>;
}) {
  const params = await searchParams;

  return <BookingClient reference={params.reference} />;
}
