import { Nav } from "@/components/nav";
import { ClickBursts, ScrollSpring } from "@/components/motion";
import { Footer, Logo } from "@/components/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav logo={<Logo />} />
      <main>{children}</main>
      <Footer />
      <ScrollSpring />
      <ClickBursts />
    </>
  );
}
