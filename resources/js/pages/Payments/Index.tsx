import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Banknote, Search, Plus } from 'lucide-react';
import Pagination from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pagos',
        href: '/payments',
    },
];

export default function Index({ recentPayments }: { recentPayments: { data: any[], links: any[] } }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial de Pagos" />
            <div className="p-6 max-w-7xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-emerald-500" />
                        Cobros Realizados
                    </h1>
                    <Link
                        href={route('payments.create')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                    >
                        <Search className="w-4 h-4" /> Registrar Cobro
                    </Link>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                        <thead className="bg-gray-50 dark:bg-zinc-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recibo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Préstamo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuota</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobrador</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                            {recentPayments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No hay pagos registrados recientemente.</td>
                                </tr>
                            ) : (
                                recentPayments.data.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            #{payment.id.toString().padStart(6, '0')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.fecha_pago).toLocaleDateString()} {new Date(payment.fecha_pago).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {payment.cuota?.prestamo?.cliente?.nombre}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            #{payment.cuota?.prestamo?.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {payment.cuota?.numero_cuota}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-emerald-600">
                                            $ {parseFloat(payment.monto_pagado).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {payment.usuario?.name}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={recentPayments.links} />
            </div>
        </AppLayout>
    );
}
