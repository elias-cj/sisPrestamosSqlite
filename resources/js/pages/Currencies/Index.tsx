
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Banknote, Plus, Pencil, Trash2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Monedas',
        href: '/currencies',
    },
];

export default function Index({ currencies }: { currencies: any[] }) {

    // Simple delete confirm
    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta moneda?')) {
            router.delete(route('currencies.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monedas" />

            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Banknote className="w-8 h-8 text-indigo-600" />
                        Gestión de Monedas
                    </h1>
                    <Link
                        href={route('currencies.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Moneda
                    </Link>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-zinc-700/50 text-gray-700 dark:text-gray-200 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">Código</th>
                                    <th className="px-6 py-4">Símbolo</th>
                                    <th className="px-6 py-4">Tipo Cambio</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                {currencies.length > 0 ? (
                                    currencies.map((currency) => (
                                        <tr key={currency.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {currency.nombre}
                                            </td>
                                            <td className="px-6 py-4">{currency.codigo}</td>
                                            <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">
                                                {currency.simbolo}
                                            </td>
                                            <td className="px-6 py-4 font-mono">
                                                {parseFloat(currency.tipo_cambio).toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${currency.estado === 'activo'
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-red-100 text-red-700 border border-red-200'
                                                    }`}>
                                                    {currency.estado.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <Link
                                                    href={route('currencies.edit', currency.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(currency.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No hay monedas registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
