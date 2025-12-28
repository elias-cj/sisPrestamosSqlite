import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Search, Eye } from 'lucide-react';
import Pagination from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Préstamos',
        href: '/loans',
    },
];

export default function Index({ loans }: { loans: { data: any[], links: any[] } }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Préstamos" />
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cartera de Préstamos</h1>
                    <div className="flex gap-2">
                        <Link
                            href={route('loans.create')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Préstamo
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                            <thead className="bg-gray-50 dark:bg-zinc-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Interés</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Frecuencia</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
                                {loans.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No hay préstamos registrados.</td>
                                    </tr>
                                ) : (
                                    loans.data.map((loan) => (
                                        <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{loan.cliente?.nombre || 'Desconocido'}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">{loan.fecha_inicio}</span>
                                                    {(!loan.socios || loan.socios.length === 0) && (
                                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 rounded border border-indigo-100 font-bold">EMPRESA</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                                {loan.moneda?.simbolo} {parseFloat(loan.monto).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {loan.interes_porcentaje}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">
                                                {loan.tipo_pago}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${loan.estado === 'activo' ? 'bg-blue-100 text-blue-800' : ''}
                                                    ${loan.estado === 'valido' ? 'bg-blue-100 text-blue-800' : ''} 
                                                    ${loan.estado === 'pagado' ? 'bg-green-100 text-green-800' : ''}
                                                    ${loan.estado === 'cancelado' ? 'bg-gray-100 text-gray-800' : ''}
                                                    ${loan.estado === 'vencido' ? 'bg-red-100 text-red-800' : ''}
                                                 `}>
                                                    {loan.estado.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('loans.show', loan.id)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 inline-flex items-center gap-1">
                                                    <Eye className="w-4 h-4" /> Ver Detalle
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={loans.links} />
            </div>
        </AppLayout>
    );
}
