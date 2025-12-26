import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Briefcase, Phone, Wallet, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Socios',
        href: '/partners',
    },
    {
        title: 'Detalle',
        href: '#',
    },
];

export default function Show({ partner }: { partner: any }) {
    const [activeTab, setActiveTab] = useState<'investments' | 'earnings'>('investments');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Socio: ${partner.nombre}`} />
            <div className="p-6 max-w-7xl mx-auto space-y-6">

                {/* Header / Stats Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 flex flex-col justify-between">
                        <div className="flex gap-4 items-start">
                            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-2xl uppercase">
                                {partner.nombre.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{partner.nombre}</h1>
                                <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {partner.documento}</span>
                                    {partner.telefono && <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {partner.telefono}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <div className="bg-gray-50 dark:bg-zinc-700/50 px-4 py-2 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase">Capital Inicial</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">${parseFloat(partner.capital_inicial).toLocaleString()}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/10 px-4 py-2 rounded-lg">
                                <p className="text-xs text-green-600 uppercase">Disponible</p>
                                <p className="text-lg font-bold text-green-700 dark:text-green-400">${parseFloat(partner.capital_disponible).toLocaleString()}</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/10 px-4 py-2 rounded-lg">
                                <p className="text-xs text-blue-600 uppercase">Comprometido</p>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">${parseFloat(partner.capital_comprometido).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 flex flex-col justify-center items-center text-center">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-3">
                            <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-sm text-gray-500 uppercase font-medium">Ganancias Totales</p>
                        <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            ${parseFloat(partner.ganancias_acumuladas).toLocaleString()}
                        </h2>
                        <p className="text-xs text-gray-400 mt-2">Participación: {partner.porcentaje_ganancia_socio}%</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-zinc-700">
                    <button
                        onClick={() => setActiveTab('investments')}
                        className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'investments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Inversiones Activas
                    </button>
                    <button
                        onClick={() => setActiveTab('earnings')}
                        className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'earnings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Historial de Ganancias
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden min-h-[300px]">
                    {activeTab === 'investments' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-zinc-700/50 text-gray-500 font-medium border-b dark:border-zinc-700">
                                    <tr>
                                        <th className="px-6 py-3">Préstamo</th>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Monto Aportado</th>
                                        <th className="px-6 py-3">Participación</th>
                                        <th className="px-6 py-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                    {partner.prestamos?.map((loan: any) => (
                                        <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                            <td className="px-6 py-4 font-medium">#{loan.id} - ${parseFloat(loan.monto).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                {new Date(loan.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                ${parseFloat(loan.pivot.monto_aportado).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {parseFloat(loan.pivot.porcentaje_participacion).toFixed(1)}%
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${loan.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                                        loan.estado === 'pagado' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {loan.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!partner.prestamos || partner.prestamos.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Sin inversiones registradas.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'earnings' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-zinc-700/50 text-gray-500 font-medium border-b dark:border-zinc-700">
                                    <tr>
                                        <th className="px-6 py-3">Origen</th>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Ganancia Socio</th>
                                        <th className="px-6 py-3">Ganancia Empresa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                    {partner.ganancias?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((ganancia: any) => (
                                        <tr key={ganancia.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                            <td className="px-6 py-4">Préstamo #{ganancia.prestamo_id}</td>
                                            <td className="px-6 py-4">
                                                {new Date(ganancia.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-green-600">
                                                ${parseFloat(ganancia.monto_ganancia_socio).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                ${parseFloat(ganancia.monto_ganancia_dueno).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!partner.ganancias || partner.ganancias.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Sin ganancias registradas.</td>
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
