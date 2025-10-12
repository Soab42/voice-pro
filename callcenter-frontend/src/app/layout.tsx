import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import TelnyxAgent from '../components/TelnyxAgent';
export const metadata = {
  title: "Call Center Dashboard",
  description: "A full-featured call center dashboard powered by Telnyx",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className="bg-gray-50 text-gray-900 mx-auto">
        <AuthProvider>{children}</AuthProvider>
        <TelnyxAgent />
      </body>
    </html>
  );
}
