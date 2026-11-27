import { requireUser, ROLE_NAMES } from "@/lib/auth";
import { Head } from "../ui";
import { PasswordForm } from "./form";

export default async function AccountPage() {
  const me = await requireUser();
  return (
    <>
      <Head title="Mon compte" sub={`${me.email} · ${ROLE_NAMES[me.role]}`} />
      <PasswordForm />
    </>
  );
}
