'use client';

import { useCart } from '@/context/CartContext';

const PHONE_NUMBER = '923123623584';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (!isOpen) return null;

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    let message = `*NEW ORDER FROM KAMRAN SPORTS WEBSITE*\n\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n   Qty: ${item.quantity} x PKR ${item.price?.toLocaleString()} = PKR ${(item.price * item.quantity).toLocaleString()}\n\n`;
    });

    message += `*TOTAL AMOUNT: PKR ${totalPrice.toLocaleString()}*\n`;
    message += `\nPlease confirm my order and share payment/delivery details.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    /* Outer Overlay: Outside click closes the drawer */
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
      onClick={() => setIsOpen(false)}
    >
      {/* Drawer Container */}
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between font-sans cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with Back Button */}
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-950 text-white">
          <button 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-xs font-extrabold uppercase text-sky-400 hover:text-white transition cursor-pointer"
          >
            <span className="text-base font-black">←</span>
            <span>Back to Shop</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide">
            <span>🛒</span>
            <span>Cart ({totalItems})</span>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 font-bold text-sm">
              Your cart is empty.
            </div>
          ) : (
            cart.map((item) => {
              const id = item._id || item.id;
              return (
                <div key={id} className="flex gap-3 border border-neutral-200 p-3 rounded-md bg-neutral-50 relative">
                  <img
                    src={item.image || item.img || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="w-16 h-16 object-cover border border-neutral-200 bg-white rounded"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-neutral-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs font-bold text-neutral-600 mt-0.5">PKR {item.price?.toLocaleString()}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-300 rounded bg-white">
                        <button
                          onClick={() => updateQuantity(id, -1)}
                          className="px-2 py-0.5 text-xs font-black hover:bg-neutral-100 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(id, 1)}
                          className="px-2 py-0.5 text-xs font-black hover:bg-neutral-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(id)}
                        className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Checkout Section */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-3">
            <div className="flex justify-between items-center text-sm font-black uppercase">
              <span>Total PKR:</span>
              <span className="text-lg text-neutral-950">PKR {totalPrice.toLocaleString()}</span>
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-md transition shadow-md cursor-pointer"
            >
              <span>Order via WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}