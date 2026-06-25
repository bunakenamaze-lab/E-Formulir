import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-black text-nu-700/20 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button className="bg-nu-700 hover:bg-nu-800 text-white" asChild>
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
