import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Wallet, Lock, Unlock, History } from 'lucide-react';
import Pagination from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Caja',
        href: '/cash',
    },
];

export default function Index({ dailyBox, history, isOpen }: { dailyBox: any, history: { data: any[], links: any[] }, isOpen: boolean }) {
    const { data, setData, post, put, processing, errors } = useForm({
        monto_apertura: '',
        observaciones: '',
    });

    const openBox = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('cash.store'));
    };

    const closeBox = () => {
        if (confirm('¿Seguro que desea cerrar la caja? Esta acción calculará los totales finales.')) {
            put(route('cash.update', dailyBox.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Caja" />
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Box Status */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Wallet className="w-6 h-6 text-indigo-500" />
                                Control de Caja Diaria
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isOpen ? 'ABIERTA' : 'CERRADA'}
                            </span>
                        </div>

                        {!isOpen ? (
                            <form onSubmit={openBox} className="space-y-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Ingrese el monto inicial para comenzar las operaciones del día.</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto de Apertura</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2"
                                        value={data.monto_apertura}
                                        onChange={e => setData('monto_apertura', e.target.value)}
                                        required
                                        placeholder="0.00"
                                    />
                                    {errors.monto_apertura && <p className="mt-1 text-sm text-red-600">{errors.monto_apertura}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Unlock className="w-4 h-4" /> Abrir Caja
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Apertura</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">${parseFloat(dailyBox.monto_apertura).toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                        <p className="text-xs text-emerald-600 uppercase">Ingresos</p>
                                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">+${parseFloat(dailyBox.total_ingresos).toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <p className="text-xs text-red-600 uppercase">Egresos</p>
                                        <p className="text-xl font-bold text-red-700 dark:text-red-400">-${parseFloat(dailyBox.total_egresos).toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
                                        <p className="text-xs text-blue-600 uppercase">Saldo Actual</p>
                                        <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                                            ${(parseFloat(dailyBox.monto_apertura) + parseFloat(dailyBox.total_ingresos) - parseFloat(dailyBox.total_egresos)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={closeBox}
                                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Lock className="w-4 h-4" /> Cerrar Caja
                                </button>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-500" /> Historial Reciente
                        </h3>
                        <div className="space-y-3">
                            {history.data.map((box) => (
                                <div key={box.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-zinc-700/50 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(box.fecha).toLocaleDateString()}</p>
                                        <p className="text-xs text-gray-500">{box.estado.toUpperCase()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Cierre: ${box.estado === 'cerrada' ? parseFloat(box.monto_cierre).toFixed(2) : '---'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Pagination links={history.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
