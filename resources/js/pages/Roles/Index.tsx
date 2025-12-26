import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import Pagination from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles y Permisos',
        href: '/roles',
    },
];

export default function Index({ roles }: { roles: { data: any[], links: any[] } }) {

    const handleDelete = (role: any) => {
        if (confirm(`¿Seguro que desea eliminar el rol "${role.nombre}"? Esto no se puede deshacer.`)) {
            router.delete(route('roles.destroy', role.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Roles" />
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-indigo-500" />
                        Roles del Sistema
                    </h1>
                    <Link
                        href={route('roles.create')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Rol
                    </Link>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                        <thead className="bg-gray-50 dark:bg-zinc-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permisos</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                            {roles.data.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                        {role.nombre}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {role.descripcion || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {role.permissions_count} permisos
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link href={route('roles.edit', role.id)} className="text-indigo-600 hover:text-indigo-900">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(role)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={role.permissions_count > 50} // Protect admin/system roles loosely? Or check names?
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination links={roles.links} />
            </div>
        </AppLayout>
    );
}
