import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import { CheckCircle2, Clock } from 'lucide-react';

interface QRPaymentModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  amount: number;
  orderId?: string;
  onPaymentSuccess?: () => void;
}

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({ 
  isOpen, 
  onOpenChange, 
  amount,
  orderId = "ORD-12345",
  onPaymentSuccess 
}) => {
  const [timeLeft, setTimeLeft] = useState(591); // 09:51
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'success'>('waiting');

  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('waiting'); // Reset status on open
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      // Simulasi pembayaran masuk setelah 5 detik
      const autoSuccess = setTimeout(() => {
        setPaymentStatus('success');
        
        // Setelah animasi sukses tampil 2 detik, baru proses checkout & tutup modal
        setTimeout(() => {
          if (onPaymentSuccess) onPaymentSuccess();
          onOpenChange();
        }, 2000);
        
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(autoSuccess);
      };
    }
  }, [isOpen, onPaymentSuccess, onOpenChange]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      placement="center"
      hideCloseButton
      isDismissable={false}
      classNames={{
        base: "bg-white border-[5px] border-[#311c52] rounded-[32px] m-4 w-full max-w-sm overflow-visible",
        body: "p-0",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <ModalBody className="relative flex flex-col p-6">
            
            {/* Top Hanging Badge */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#e11d48] border-[4px] border-[#311c52] text-white px-6 py-1 rounded-full shadow-[0px_4px_0px_0px_rgba(49,28,82,1)] z-20">
              <span className="font-black italic text-lg tracking-widest">QRIS</span>
            </div>

            {/* Header Text */}
            <div className="mt-4 mb-6 text-center">
              <h1 className="text-3xl font-black text-[#311c52] uppercase tracking-wide">
                SCAN TO PAY
              </h1>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <CheckCircle2 size={14} className="text-[#10b981]" strokeWidth={3} />
                <span className="text-[#10b981] font-bold text-xs tracking-widest">SECURE PAYMENT</span>
              </div>
            </div>

            {/* Main Inner Box */}
            <div className={`border-[4px] border-[#311c52] rounded-[24px] p-6 flex flex-col items-center bg-gray-50/50 transition-colors duration-500 ${paymentStatus === 'success' ? 'bg-emerald-50' : ''}`}>
              
              <h2 className="text-[15px] font-black text-[#311c52] mb-1">
                Total Pembayaran
              </h2>
              <p className="text-3xl font-black text-[#e11d48] mb-6">
                Rp {amount.toLocaleString('id-ID')}
              </p>

              {/* Dynamic QR Code Container / Success Checkmark */}
              <div className={`border-[4px] border-[#311c52] rounded-[20px] p-2 bg-white relative w-[200px] h-[200px] flex items-center justify-center transition-all duration-500 overflow-hidden ${paymentStatus === 'success' ? 'bg-emerald-400 scale-105' : ''}`}>
                
                {paymentStatus === 'waiting' ? (
                  <>
                    {/* QR Pattern */}
                    <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover bg-center mix-blend-multiply opacity-90"></div>
                    
                    {/* Center Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white border-[3px] border-[#311c52] rounded-full px-3 py-1 shadow-sm">
                        <span className="text-[#e11d48] font-black text-[13px] tracking-widest italic">QRIS</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-white animate-pulse">
                    <CheckCircle2 size={64} strokeWidth={3} className="drop-shadow-lg" />
                    <span className="font-black text-lg mt-2 tracking-wide text-center">PAID!</span>
                  </div>
                )}
                
              </div>

              {/* Timer / Status Badge */}
              {paymentStatus === 'waiting' ? (
                <div className="border-[2px] border-gray-200 bg-white rounded-full px-4 py-2 mt-6 flex items-center gap-2">
                  <Clock size={14} className="text-orange-400" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-gray-500">Menunggu Pembayaran... {formatTime(timeLeft)}</span>
                </div>
              ) : (
                <div className="border-[2px] border-emerald-500 bg-emerald-100 rounded-full px-4 py-2 mt-6 flex items-center gap-2 animate-bounce">
                  <span className="text-xs font-black text-emerald-700 tracking-wider">PEMBAYARAN BERHASIL!</span>
                </div>
              )}
              
            </div>

            {/* Order ID Box */}
            <div className="border-[3px] border-[#311c52] rounded-xl px-4 py-3 flex justify-between items-center mt-4 bg-white opacity-80">
              <span className="text-[#311c52] font-bold text-[13px]">Order ID:</span>
              <span className="text-[#311c52] font-black text-[14px]">{orderId}</span>
            </div>

            {/* Action Button */}
            <Button 
              className={`w-full h-14 border-[4px] border-[#311c52] text-white font-black rounded-xl mt-4 text-[15px] transition-all active:translate-y-1 ${paymentStatus === 'success' ? 'bg-emerald-500 pointer-events-none' : 'bg-[#e11d48]'}`}
              style={{ boxShadow: paymentStatus === 'success' ? 'none' : "0px 4px 0px 0px rgba(49,28,82,1)" }}
              onPress={() => {
                if(paymentStatus === 'waiting') {
                  setPaymentStatus('success');
                  setTimeout(() => {
                    if (onPaymentSuccess) onPaymentSuccess();
                    onClose();
                  }, 2000);
                }
              }}
            >
              {paymentStatus === 'success' ? 'Meneruskan Pesanan...' : 'Simulasikan Bayar (Demo)'}
            </Button>

          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

