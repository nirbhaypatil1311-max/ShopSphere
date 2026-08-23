import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers";

export const metadata = {
  title: "ShopSphere",
  description: "Modern full-stack e-commerce platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"  >
      <body>
        <Providers>
          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}