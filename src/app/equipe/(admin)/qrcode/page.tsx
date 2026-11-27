import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { Head } from "../ui";
import { QrGenerator } from "./generator";

export default async function QrPage() {
  await requireUser();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return (
    <>
      <Head title="QR codes" sub="Générateur illimité, badge OUT! au centre" />
      <QrGenerator defaultUrl={`${proto}://${host}/questionnaire`} />
    </>
  );
}
