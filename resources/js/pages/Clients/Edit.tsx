import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: '/clients',
    },
    {
        title: 'Editar',
        href: '#',
    },
];

interface ClientFormData {
    nombre: string;
    documento: string;
    telefono: string;
    direccion: string;
    estado_crediticio: string;
}

export default function Edit({ client }: { client: any }) {
    const { data, setData, put, processing, errors } = useForm<ClientFormData>({
        nombre: client.nombre,
        documento: client.documento,
        telefono: client.telefono || '',
        direccion: client.direccion || '',
        estado_crediticio: client.estado_crediticio,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('clients.update', client.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Cliente" />
            <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Editar Cliente: {client.nombre}</h2>

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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Documento de Identidad</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                                value={data.documento}
                                onChange={e => setData('documento', e.target.value)}
                                required
                            />
                            {errors.documento && <p className="mt-1 text-sm text-red-600">{errors.documento}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                                    value={data.telefono}
                                    onChange={e => setData('telefono', e.target.value)}
                                />
                                {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                                    value={data.direccion}
                                    onChange={e => setData('direccion', e.target.value)}
                                />
                                {errors.direccion && <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado Crediticio</label>
                            <select
                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                                value={data.estado_crediticio}
                                onChange={e => setData('estado_crediticio', e.target.value)}
                            >
                                <option value="normal">Normal</option>
                                <option value="moroso">Moroso</option>
                                <option value="incobrable">Incobrable</option>
                            </select>
                            {errors.estado_crediticio && <p className="mt-1 text-sm text-red-600">{errors.estado_crediticio}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link
                                href={route('clients.index')}
                                className="px-4 py-2 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                            >
                                Actualizar Cliente
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
