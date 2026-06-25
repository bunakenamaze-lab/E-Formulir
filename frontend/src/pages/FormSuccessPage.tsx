import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FormSuccessPage() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border shadow-lg p-10 text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-nu-700/10 mx-auto mb-5"
        >
          <CheckCircle2 className="h-10 w-10 text-nu-700" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Terima Kasih! 🎉
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Respon Anda telah berhasil dikirim. Kami akan memproses data Anda segera.
        </p>

        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => window.location.href = `/f/${slug}`}
            className="w-full"
          >
            Isi Lagi
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full bg-nu-700 hover:bg-nu-800 text-white"
          >
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Sistem Formulir Digital PCNU Kota Bandung
        </p>
      </motion.div>
    </div>
  );
}
