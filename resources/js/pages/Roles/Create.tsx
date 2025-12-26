import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Shield, Save, ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/roles' },
    { title: 'Nuevo', href: '#' },
];

export default function Create({ permissions }: { permissions: Record<string, any[]> }) {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        descripcion: '',
        permissions: [] as number[],
    });

    const handleCheckboxChange = (id: number, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, id]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== id));
        }
    };

    const toggleModule = (modulePermissions: any[], checked: boolean) => {
        const ids = modulePermissions.map(p => p.id);
        if (checked) {
            // Add all missing ids
            const newPermissions = [...data.permissions];
            ids.forEach((id: number) => {
                if (!newPermissions.includes(id)) newPermissions.push(id);
            });
            setData('permissions', newPermissions);
        } else {
            // Remove all ids
            setData('permissions', data.permissions.filter(id => !ids.includes(id)));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('roles.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Rol" />
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-zinc-700 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-500" /> Crear Nuevo Rol
                        </h2>
                        <Link href={route('roles.index')} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                            <ArrowLeft className="w-4 h-4" /> Volver
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Rol</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.nombre}
                                    onChange={e => setData('nombre', e.target.value)}
                                    required
                                />
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.descripcion}
                                    onChange={e => setData('descripcion', e.target.value)}
                                />
                                {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Permisos del Sistema</h3>
                            <div className="space-y-6">
                                {Object.entries(permissions).map(([modulo, perms]) => (
                                    <div key={modulo} className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <input
                                                type="checkbox"
                                                className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-600 dark:bg-zinc-800"
                                                onChange={(e) => toggleModule(perms, e.target.checked)}
                                                checked={perms.every(p => data.permissions.includes(p.id))}
                                            />
                                            <h4 className="font-bold text-gray-700 dark:text-gray-300 capitalize text-sm">{modulo}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 ml-6">
                                            {perms.map((perm) => (
                                                <div key={perm.id} className="flex items-start gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`perm-${perm.id}`}
                                                        value={perm.id}
                                                        checked={data.permissions.includes(perm.id)}
                                                        onChange={(e) => handleCheckboxChange(perm.id, e.target.checked)}
                                                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-600 dark:bg-zinc-800"
                                                    />
                                                    <label htmlFor={`perm-${perm.id}`} className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                                        {perm.nombre}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-zinc-700">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" /> Guardar Rol
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
