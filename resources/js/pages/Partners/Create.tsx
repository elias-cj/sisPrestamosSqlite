import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Socios',
        href: '/partners',
    },
    {
        title: 'Nuevo',
        href: '/partners/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        documento: '',
        telefono: '',
        capital_inicial: '',
        porcentaje_ganancia_socio: 70,
        porcentaje_ganancia_dueno: 30, // Default constraint
    });

    // Auto-balance percentages
    useEffect(() => {
        const socio = Number(data.porcentaje_ganancia_socio);
        if (socio >= 0 && socio <= 100) {
            setData('porcentaje_ganancia_dueno', 100 - socio);
        }
    }, [data.porcentaje_ganancia_socio]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('partners.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Socio" />
            <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Registrar Nuevo Socio Inversionista</h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                required
                            />
                            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Documento</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                                    value={data.documento}
                                    onChange={e => setData('documento', e.target.value)}
                                    required
                                />
                                {errors.documento && <p className="mt-1 text-sm text-red-600">{errors.documento}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                                    value={data.telefono}
                                    onChange={e => setData('telefono', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capital Inicial de Inversión</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="block w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                                    placeholder="0.00"
                                    value={data.capital_inicial}
                                    onChange={e => setData('capital_inicial', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.capital_inicial && <p className="mt-1 text-sm text-red-600">{errors.capital_inicial}</p>}
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-700">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Distribución de Ganancias</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">% Socio</label>
                                    <input
                                        type="number"
                                        min="0" max="100"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 px-3 py-2"
                                        value={data.porcentaje_ganancia_socio}
                                        onChange={e => setData('porcentaje_ganancia_socio', Number(e.target.value))}
                                    />
                                </div>
                                <div className="opacity-75">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">% Empresa (Dueño)</label>
                                    <input
                                        type="number"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 px-3 py-2 bg-gray-100 dark:bg-zinc-800"
                                        value={data.porcentaje_ganancia_dueno}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">La suma debe ser siempre 100%</p>
                            {errors.porcentaje_ganancia_socio && <p className="mt-1 text-sm text-red-600">{errors.porcentaje_ganancia_socio}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link
                                href={route('partners.index')}
                                className="px-4 py-2 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                            >
                                Guardar Socio
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
