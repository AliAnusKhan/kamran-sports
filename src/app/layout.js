import './globals.css';
import './motion.css';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';

export const metadata = {
  title: 'Kamran Sports - Original Cricket & Sports Gear',
  description: '100% Original Cricket Equipment & Repair Services across Pakistan',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}