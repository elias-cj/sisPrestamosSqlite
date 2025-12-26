import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Building2, Wallet } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-zinc-950">
            <Head title="Acceder al Sistema" />

            {/* Left Side - Hero / Branding */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

                <div className="relative z-10 p-12 text-white max-w-lg">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl">
                            <Wallet className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">sis<span className="text-indigo-400">Prestamos</span></h1>
                    </div>
                    <h2 className="text-4xl font-extrabold mb-6 leading-tight">
                        Gestión Financiera Inteligente y Segura.
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        Controla préstamos, gestiona socios y monitorea tu flujo de caja en tiempo real con nuestra plataforma avanzada.
                    </p>

                    <div className="mt-12 flex items-center gap-4 text-sm text-zinc-500 font-medium">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs">
                                    <Building2 className="w-4 h-4 text-zinc-600" />
                                </div>
                            ))}
                        </div>
                        <p>Empresas confían en nosotros</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Bienvenido de nuevo
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Ingresa tus credenciales para acceder al panel.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Correo Electrónico</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="admin@empresa.com"
                                                className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 h-11"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center">
                                                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Contraseña</Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                                        tabIndex={5}
                                                    >
                                                        ¿Olvidaste tu contraseña?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 h-11"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                                className="border-gray-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <Label htmlFor="remember" className="font-normal text-gray-600 dark:text-gray-400">Recordar sesión</Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-2 w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/30"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner className="mr-2" />}
                                            Iniciar Sesión
                                        </Button>
                                    </div>

                                    {canRegister && (
                                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                                            ¿No tienes una cuenta?{' '}
                                            <TextLink href={register()} tabIndex={5} className="font-bold text-indigo-600 hover:text-indigo-500">
                                                Regístrate aquí
                                            </TextLink>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-8">
                        &copy; 2025 sisPrestamos. Todos los derechos reservados.
                    </p>
                </div>
            </div>

            {status && (
                <div className="fixed bottom-4 right-4 bg-green-50 text-green-700 px-4 py-3 rounded shadow-lg border border-green-200 z-50 animate-fade-in-up">
                    {status}
                </div>
            )}
        </div>
    );
}
