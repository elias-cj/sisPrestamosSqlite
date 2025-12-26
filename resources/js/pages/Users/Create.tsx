import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { User, Save, ArrowLeft, Shield } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/users' },
    { title: 'Nuevo', href: '#' },
];

export default function Create({ roles }: { roles: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as number[],
    });

    const toggleRole = (id: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, id]);
        } else {
            setData('roles', data.roles.filter(r => r !== id));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Nuevo Usuario" />
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-zinc-700 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-500" /> Crear Nuevo Usuario
                        </h2>
                        <Link href={route('users.index')} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                            <ArrowLeft className="w-4 h-4" /> Volver
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asignar Roles</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {roles.map((role) => (
                                        <div key={role.id} className={`flex items-center p-3 rounded-lg border ${data.roles.includes(role.id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-zinc-700'}`}>
                                            <input
                                                type="checkbox"
                                                id={`role-${role.id}`}
                                                value={role.id}
                                                checked={data.roles.includes(role.id)}
                                                onChange={(e) => toggleRole(role.id, e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`role-${role.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer select-none">
                                                <span className="font-medium">{role.nombre}</span>
                                                {role.descripcion && <span className="block text-xs text-gray-500">{role.descripcion}</span>}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.roles && <p className="text-red-500 text-xs mt-1">{errors.roles}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-zinc-700">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" /> Guardar Usuario
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
