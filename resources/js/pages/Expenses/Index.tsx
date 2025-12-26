import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gastos',
        href: '/expenses',
    },
];

export default function Index({ expenses, categories, currencies, isBoxOpen }: { expenses: { data: any[], links: any[] }, categories: any[], currencies: any[], isBoxOpen: boolean }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        categoria_gasto_id: '',
        descripcion: '',
        monto: '',
        moneda_id: currencies.length > 0 ? currencies[0].id : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('expenses.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    const deleteExpense = (id: string) => {
        if (confirm('¿Está seguro de anular este gasto? Se revertirá de la caja.')) {
            router.delete(route('expenses.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control de Gastos" />
            <div className="p-6 max-w-7xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-red-500" />
                        Gastos Operativos
                    </h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={!isBoxOpen}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!isBoxOpen ? 'Debe abrir caja primero' : ''}
                    >
                        <Plus className="w-4 h-4" /> Registrar Gasto
                    </button>
                </div>

                {!isBoxOpen && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    La caja está cerrada. No se pueden registrar nuevos gastos hasta que se abra una caja.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                        <thead className="bg-gray-50 dark:bg-zinc-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                            {expenses.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No hay gastos registrados.</td>
                                </tr>
                            ) : (
                                expenses.data.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(expense.fecha).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {expense.categoria?.nombre}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {expense.descripcion}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                            - {parseFloat(expense.monto).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 text-xs font-semibold rounded-full
                                                ${expense.estado === 'registrado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 line-through'}
                                            `}>
                                                {expense.estado.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {expense.estado === 'registrado' && isBoxOpen && (
                                                <button onClick={() => deleteExpense(expense.id)} className="text-red-600 hover:text-red-900" title="Anular">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={expenses.links} />

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Registrar Nuevo Gasto</h3>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2"
                                        value={data.categoria_gasto_id}
                                        onChange={e => setData('categoria_gasto_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.categoria_gasto_id && <p className="text-red-600 text-xs mt-1">{errors.categoria_gasto_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2"
                                        value={data.descripcion}
                                        onChange={e => setData('descripcion', e.target.value)}
                                        required
                                    />
                                    {errors.descripcion && <p className="text-red-600 text-xs mt-1">{errors.descripcion}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2"
                                        value={data.monto}
                                        onChange={e => setData('monto', e.target.value)}
                                        required
                                    />
                                    {errors.monto && <p className="text-red-600 text-xs mt-1">{errors.monto}</p>}
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                    <button type="submit" disabled={processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Guardar Gasto</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
