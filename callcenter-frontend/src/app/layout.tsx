import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Call Center Dashboard',
  description: 'A full-featured call center dashboard powered by Telnyx',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}