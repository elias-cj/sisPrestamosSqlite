import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Trophy, AlertTriangle, UserCheck, UserX } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reportes',
        href: '/reports',
    },
    {
        title: 'Ranking de Pagadores',
        href: '/ranking',
    },
];

export default function Index({ goodPayers, badPayers }: { goodPayers: any[], badPayers: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ranking de Pagadores" />
            <div className="p-6 max-w-7xl mx-auto space-y-8">

                <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ranking de Comportamiento</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                    Análisis detallado del comportamiento de pago de sus clientes. Identifique a sus mejores socios y gestione el riesgo.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Good Payers */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center bg-green-50 dark:bg-green-900/10">
                            <div>
                                <h2 className="text-xl font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
                                    <UserCheck className="w-5 h-5" /> Buenos Pagadores
                                </h2>
                                <p className="text-xs text-green-600 dark:text-green-500 mt-1">Sin mora histórica, más préstamos pagados</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-700/50 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-6 py-3 text-right">Préstamos Pagados</th>
                                        <th className="px-6 py-3 text-right">Puntaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {goodPayers.length > 0 ? goodPayers.map((client, index) => (
                                        <tr key={client.id} className="bg-white dark:bg-zinc-800 border-b dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                {client.nombre}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {client.prestamos_pagados}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                                                    Excelente
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No hay datos suficientes</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bad Payers */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center bg-red-50 dark:bg-red-900/10">
                            <div>
                                <h2 className="text-xl font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
                                    <UserX className="w-5 h-5" /> Riesgo de Mora
                                </h2>
                                <p className="text-xs text-red-600 dark:text-red-500 mt-1">Mayor monto acumulado en mora</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-700/50 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-6 py-3 text-right">Préstamos Activos</th>
                                        <th className="px-6 py-3 text-right">Mora Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {badPayers.length > 0 ? badPayers.map((client, index) => (
                                        <tr key={client.id} className="bg-white dark:bg-zinc-800 border-b dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                {client.nombre}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {client.active_loans}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-red-600">
                                                ${client.total_mora.toLocaleString()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No hay clientes con mora registrada</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
