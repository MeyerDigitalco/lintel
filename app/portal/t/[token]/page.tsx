import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default function Moved({ params }: { params: { token: string } }) {
  redirect(`/t/${params.token}`);
}
