
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Banknote, Save, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Monedas',
        href: '/currencies',
    },
    {
        title: 'Editar',
        href: '#',
    },
];

export default function Edit({ currency }: { currency: any }) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: currency.nombre,
        codigo: currency.codigo,
        simbolo: currency.simbolo,
        tipo_cambio: currency.tipo_cambio,
        estado: currency.estado,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('currencies.update', currency.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Moneda" />

            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
                    <div className="mb-6 flex items-center gap-3 border-b border-gray-100 dark:border-zinc-700 pb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                            <Banknote className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Editar Moneda: {currency.nombre}</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre de la Moneda
                                </label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={e => setData('nombre', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {errors.nombre && <p className="text-sm text-red-600 mt-1">{errors.nombre}</p>}
                            </div>

                            {/* Código */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Código ISO
                                </label>
                                <input
                                    type="text"
                                    value={data.codigo}
                                    onChange={e => setData('codigo', e.target.value.toUpperCase())}
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                                    maxLength={5}
                                    required
                                />
                                {errors.codigo && <p className="text-sm text-red-600 mt-1">{errors.codigo}</p>}
                            </div>

                            {/* Símbolo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Símbolo
                                </label>
                                <input
                                    type="text"
                                    value={data.simbolo}
                                    onChange={e => setData('simbolo', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {errors.simbolo && <p className="text-sm text-red-600 mt-1">{errors.simbolo}</p>}
                            </div>

                            {/* Tipo de Cambio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo de Cambio
                                </label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={data.tipo_cambio}
                                    onChange={e => setData('tipo_cambio', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {errors.tipo_cambio && <p className="text-sm text-red-600 mt-1">{errors.tipo_cambio}</p>}
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Estado
                                </label>
                                <select
                                    value={data.estado}
                                    onChange={e => setData('estado', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                                {errors.estado && <p className="text-sm text-red-600 mt-1">{errors.estado}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-zinc-700">
                            <Link
                                href={route('currencies.index')}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg flex items-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                Actualizar Moneda
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
