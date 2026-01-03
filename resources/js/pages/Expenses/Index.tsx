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

interface ExpenseForm {
    categoria_gasto_id: string | number;
    descripcion: string;
    monto: string | number;
    moneda_id: string | number;
    [key: string]: any;
}

export default function Index({ expenses, categories, currencies, isBoxOpen, filters }: { expenses: { data: any[], links: any[] }, categories: any[], currencies: any[], isBoxOpen: boolean, filters: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, errors: formErrors, reset } = useForm<ExpenseForm>({
        categoria_gasto_id: '',
        descripcion: '',
        monto: '',
        moneda_id: (currencies && currencies.length > 0) ? currencies[0].id : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/expenses', {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    const deleteExpense = (id: string | number) => {
        if (confirm('¿Está seguro de anular este gasto? Se revertirá de la caja.')) {
            router.delete(`/expenses/${id}`);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/expenses', { ...filters, [key]: value }, { preserveState: true });
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

                {/* Filtros */}
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 mb-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Desde</label>
                            <input
                                type="date"
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                                value={filters?.from_date || ''}
                                onChange={(e) => handleFilterChange('from_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Hasta</label>
                            <input
                                type="date"
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                                value={filters?.to_date || ''}
                                onChange={(e) => handleFilterChange('to_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Hora Inicio</label>
                            <input
                                type="time"
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                                value={filters?.from_time || ''}
                                onChange={(e) => handleFilterChange('from_time', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Hora Fin</label>
                            <input
                                type="time"
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                                value={filters?.to_time || ''}
                                onChange={(e) => handleFilterChange('to_time', e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href="/expenses"
                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm text-center font-medium transition-colors"
                            >
                                Limpiar
                            </Link>
                        </div>
                    </div>
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
                                            <div className="flex flex-col">
                                                <span>{new Date(expense.fecha).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-gray-400">{new Date(expense.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {expense.categoria?.nombre}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {expense.descripcion}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                            - {parseFloat(expense.monto).toFixed(2)} {expense.moneda?.simbolo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 text-xs font-semibold rounded-full
                                                ${expense.estado === 'registrado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 line-through'}
                                            `}>
                                                {expense.estado?.toUpperCase()}
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
                                    {formErrors.categoria_gasto_id && <p className="text-red-600 text-xs mt-1">{formErrors.categoria_gasto_id}</p>}
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
                                    {formErrors.descripcion && <p className="text-red-600 text-xs mt-1">{formErrors.descripcion}</p>}
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
                                    {formErrors.monto && <p className="text-red-600 text-xs mt-1">{formErrors.monto}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2"
                                        value={data.moneda_id}
                                        onChange={e => setData('moneda_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {currencies.map(mon => (
                                            <option key={mon.id} value={mon.id}>{mon.nombre} ({mon.simbolo})</option>
                                        ))}
                                    </select>
                                    {formErrors.moneda_id && <p className="text-red-600 text-xs mt-1">{formErrors.moneda_id}</p>}
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
