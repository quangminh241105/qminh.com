import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <div id="main-content" className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
