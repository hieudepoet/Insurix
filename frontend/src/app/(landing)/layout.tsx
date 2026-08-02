import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </SmoothScroll>
  );
}
