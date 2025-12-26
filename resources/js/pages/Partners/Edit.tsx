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
        title: 'Editar',
        href: '#',
    },
];

interface PartnerFormData {
    nombre: string;
    documento: string;
    telefono: string;
    capital_inicial: number | string;
    porcentaje_ganancia_socio: number | string;
    porcentaje_ganancia_dueno: number | string;
    estado: string;
}

export default function Edit({ partner }: { partner: any }) {
    const { data, setData, put, processing, errors } = useForm<PartnerFormData>({
        nombre: partner.nombre,
        documento: partner.documento,
        telefono: partner.telefono || '',
        capital_inicial: partner.capital_inicial,
        porcentaje_ganancia_socio: partner.porcentaje_ganancia_socio,
        porcentaje_ganancia_dueno: partner.porcentaje_ganancia_dueno,
        estado: partner.estado,
    });

    useEffect(() => {
        const socio = Number(data.porcentaje_ganancia_socio);
        if (socio >= 0 && socio <= 100) {
            setData('porcentaje_ganancia_dueno', 100 - socio);
        }
    }, [data.porcentaje_ganancia_socio]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('partners.update', partner.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Socio" />
            <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Editar Socio</h2>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Fields similar to Create, plus Status */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Documento</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                                value={data.documento}
                                onChange={e => setData('documento', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capital Inicial (Ajuste Manual)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2"
                                value={data.capital_inicial}
                                onChange={e => setData('capital_inicial', e.target.value)}
                                required
                            />
                            <p className="text-xs text-yellow-600 mt-1">Cuidado: Modificar esto afectará el capital disponible.</p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-700">
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
                                    <label className="block text-xs font-medium text-gray-500 mb-1">% Empresa</label>
                                    <input
                                        type="number"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 px-3 py-2 bg-gray-100 dark:bg-zinc-800"
                                        value={data.porcentaje_ganancia_dueno}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                            <select
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2"
                                value={data.estado}
                                onChange={e => setData('estado', e.target.value)}
                            >
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
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
                                Actualizar Socio
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
