import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { User, Phone, MapPin, FileText, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: '/clients',
    },
    {
        title: 'Detalle',
        href: '#',
    },
];

export default function Show({ client }: { client: any }) {
    const [activeTab, setActiveTab] = useState<'loans' | 'history'>('loans');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cliente: ${client.nombre}`} />
            <div className="p-6 max-w-7xl mx-auto space-y-6">

                {/* Header / Info Card */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl uppercase">
                                {client.nombre.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.nombre}</h1>
                                <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {client.documento}</span>
                                    {client.phone && <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {client.telefono}</span>}
                                    {client.direccion && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {client.direccion}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 items-end">
                            <div className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${client.estado_crediticio === 'normal' ? 'bg-green-100 text-green-800' :
                                    client.estado_crediticio === 'moroso' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {client.estado_crediticio}
                            </div>
                            <Link href={route('loans.create')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Nuevo Préstamo
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-zinc-700">
                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'loans' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Historial de Préstamos
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Pagos Realizados
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden min-h-[300px]">
                    {activeTab === 'loans' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-zinc-700/50 text-gray-500 font-medium border-b dark:border-zinc-700">
                                    <tr>
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Monto</th>
                                        <th className="px-6 py-3">Estado</th>
                                        <th className="px-6 py-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                    {client.prestamos?.map((loan: any) => (
                                        <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                            <td className="px-6 py-4">#{loan.id}</td>
                                            <td className="px-6 py-4">
                                                {new Date(loan.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                ${parseFloat(loan.monto).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${loan.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                                        loan.estado === 'pagado' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {loan.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={route('loans.show', loan.id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase">
                                                    Ver Detalle
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!client.prestamos || client.prestamos.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Sin préstamos registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-zinc-700/50 text-gray-500 font-medium border-b dark:border-zinc-700">
                                    <tr>
                                        <th className="px-6 py-3">Ref. Préstamo</th>
                                        <th className="px-6 py-3">Fecha Pago</th>
                                        <th className="px-6 py-3">Monto Pagado</th>
                                        <th className="px-6 py-3">Método</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                    {client.prestamos?.flatMap((l: any) => l.pagos?.map((p: any) => ({ ...p, loan_id: l.id }))).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((pago: any) => (
                                        <tr key={pago.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                            <td className="px-6 py-4">Préstamo #{pago.loan_id}</td>
                                            <td className="px-6 py-4">
                                                {new Date(pago.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-green-600">
                                                ${parseFloat(pago.monto).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 capitalize">
                                                {pago.metodo_pago || 'Efectivo'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!client.prestamos || client.prestamos.every((l: any) => !l.pagos || l.pagos.length === 0)) && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Sin pagos registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
