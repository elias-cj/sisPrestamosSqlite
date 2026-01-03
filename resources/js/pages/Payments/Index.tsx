import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Banknote, Search, Plus, Trash2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Pagination from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pagos',
        href: '/payments',
    },
];

export default function Index({ recentPayments }: { recentPayments: { data: any[], links: any[] } }) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth.user?.roles?.some((r: any) => r.nombre === 'Administrador');
    const [isAnnulling, setIsAnnulling] = useState<number | null>(null);

    const { data, setData, delete: destroy, processing, errors, reset } = useForm({
        motivo_anulacion: '',
    });

    const openAnnulModal = (id: number) => {
        setIsAnnulling(id);
        reset();
    };

    const handleAnnul = (e: React.FormEvent) => {
        e.preventDefault();
        if (isAnnulling) {
            destroy(route('payments.destroy', isAnnulling), {
                onSuccess: () => {
                    setIsAnnulling(null);
                    reset();
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial de Pagos" />
            <div className="p-6 w-full mx-auto">

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
                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recibo</th>
                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuota</th>
                                <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase">Principal</th>
                                <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mora</th>
                                <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobrador</th>
                                <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                            {recentPayments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">No hay pagos registrados recientemente.</td>
                                </tr>
                            ) : (
                                recentPayments.data.map((payment) => {
                                    const isAnulado = payment.estado === 'anulado';
                                    return (
                                        <tr key={payment.id} className={`hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors ${isAnulado ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                            <td className={`px-2 py-4 whitespace-nowrap text-sm ${isAnulado ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                                                #{payment.id.toString().padStart(6, '0')}
                                            </td>
                                            <td className={`px-2 py-4 whitespace-nowrap text-sm ${isAnulado ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {new Date(payment.fecha_pago).toLocaleDateString()} {new Date(payment.fecha_pago).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className={`px-2 py-4 whitespace-nowrap text-sm font-medium ${isAnulado ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                {payment.cuota?.prestamo?.cliente?.nombre}
                                            </td>
                                            <td className={`px-2 py-4 whitespace-nowrap text-sm ${isAnulado ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {payment.cuota?.numero_cuota}
                                            </td>
                                            <td className={`px-2 py-4 whitespace-nowrap text-right text-sm font-medium ${isAnulado ? 'text-gray-300' : 'text-gray-900 dark:text-gray-300'}`}>
                                                $ {parseFloat(payment.monto_pagado).toFixed(2)}
                                            </td>
                                            <td className={`px-2 py-4 whitespace-nowrap text-right text-sm font-bold ${isAnulado ? 'text-gray-300' : 'text-orange-600'}`}>
                                                $ {parseFloat(payment.mora || 0).toFixed(2)}
                                            </td>
                                            <td className={`px-2 py-4 whitespace-nowrap text-right text-sm font-black ${isAnulado ? 'text-gray-300' : 'text-emerald-600'}`}>
                                                $ {(parseFloat(payment.monto_pagado) + parseFloat(payment.mora || 0)).toFixed(2)}
                                            </td>
                                            <td className={`px-2 py-4 whitespace-nowrap text-sm ${isAnulado ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {payment.usuario?.name}
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isAnulado
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                    {payment.estado}
                                                </span>
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {isAdmin && !isAnulado && (
                                                    <button
                                                        onClick={() => openAnnulModal(payment.id)}
                                                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        title="Anular Pago"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={recentPayments.links} />

                {/* Modal de Anulación */}
                {isAnnulling && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-red-200 dark:border-red-900/30">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                                            <AlertTriangle className="w-6 h-6 text-red-600" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white capitalize">
                                            Anular Pago
                                        </h3>
                                    </div>
                                    <button onClick={() => setIsAnnulling(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex gap-3">
                                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                                        Esta acción revertirá los saldos de caja y cuotas. Los socios también verán descontadas sus ganancias asociadas a este pago.
                                    </p>
                                </div>

                                <form onSubmit={handleAnnul} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Motivo de la Anulación (Mín. 20 caracteres)</label>
                                        <textarea
                                            className="w-full rounded-2xl border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 px-6 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all min-h-[120px]"
                                            placeholder="Describa detalladamente por qué anula este pago..."
                                            value={data.motivo_anulacion}
                                            onChange={e => setData('motivo_anulacion', e.target.value)}
                                            required
                                        />
                                        <div className="flex justify-between mt-2 px-2 text-[10px] font-black uppercase tracking-widest">
                                            <span className={data.motivo_anulacion.length < 20 ? 'text-red-500' : 'text-emerald-500'}>
                                                Caracteres: {data.motivo_anulacion.length} / 20
                                            </span>
                                            {errors.motivo_anulacion && <span className="text-red-500">{errors.motivo_anulacion}</span>}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsAnnulling(null)}
                                            className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing || data.motivo_anulacion.length < 20}
                                            className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                                        >
                                            {processing ? 'Procesando...' : <><Trash2 className="w-5 h-5" /> Confirmar Anulación</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
