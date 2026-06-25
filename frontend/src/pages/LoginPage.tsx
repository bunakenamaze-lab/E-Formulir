import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const login = useLogin();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => login.mutate(data);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 nu-gradient islamic-pattern flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 translate-y-40 -translate-x-40" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center z-10"
        >
          {/* Logo */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-2xl">
            <span className="text-3xl font-black text-white">NU</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Sistem Formulir Digital</h1>
          <h2 className="text-xl font-semibold text-white/90 mb-6">
            PCNU Kota Bandung
          </h2>
          <p className="text-white/70 text-sm max-w-xs leading-relaxed">
            Platform digital untuk membuat, mengelola, dan membagikan formulir
            kebutuhan organisasi Nahdlatul Ulama
          </p>

          {/* Features */}
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { icon: '📝', text: 'Form Builder Drag & Drop' },
              { icon: '📊', text: 'Dashboard Analytics' },
              { icon: '📱', text: 'Mobile Friendly' },
              { icon: '🔗', text: 'Share via QR Code' },
            ].map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2"
              >
                <span className="text-base">{feature.icon}</span>
                <span className="text-xs font-medium text-white/90">{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 dark:bg-gray-950 p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-nu-700">
              <span className="text-2xl font-black text-white">NU</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sistem Formulir Digital</h1>
            <p className="text-sm text-gray-500">PCNU Kota Bandung</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
              <CardDescription>
                Masukkan email dan password untuk mengakses sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@pcnubandung.or.id"
                      className="pl-10"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      className="pl-10 pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-nu-700 hover:bg-nu-800 text-white font-semibold"
                  disabled={login.isPending}
                >
                  {login.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </Button>
              </form>

              {/* Demo credentials */}
              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Akun Demo:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><span className="font-medium">Super Admin:</span> superadmin@pcnubandung.or.id / SuperAdmin123!</p>
                  <p><span className="font-medium">Admin:</span> admin@pcnubandung.or.id / Admin123!</p>
                  <p><span className="font-medium">Operator:</span> operator@pcnubandung.or.id / Operator123!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PCNU Kota Bandung. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
