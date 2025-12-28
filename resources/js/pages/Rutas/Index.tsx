import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Lock, Unlock, Map as MapIcon } from 'lucide-react';
import ClienteRutaCard from '@/components/ClienteRutaCard';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    UniqueIdentifier,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rutas',
        href: '/rutas',
    },
];

interface Cliente {
    cliente_id: number;
    nombre: string;
    documento: string;
    ubicaciones: any[];
    prestamo_id: number;
    cuota_id: number;
    monto_cobrar: number;
    monto_pagado: number;
    cuotas_pendientes: number;
    dias_mora: number;
    posicion: number;
    estado: 'pendiente' | 'pagado' | 'mas_tarde' | 'saltado';
    nota?: string;
    hora_estimada?: string;
}

interface Stats {
    total_pendiente: number;
    total_cobrado: number;
    count_pendientes: number;
    count_pagados: number;
    count_mas_tarde: number;
    count_saltados: number;
}

interface RutaInfo {
    id: number;
    fecha: string;
    bloqueada: boolean;
}

function SortableItem({ id, children }: { id: UniqueIdentifier; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

export default function Index({
    clientes: initialClientes,
    ruta,
    stats,
}: {
    clientes: Cliente[];
    ruta: RutaInfo;
    stats: Stats;
}) {
    const { auth } = usePage<any>().props;
    const [clientes, setClientes] = useState(initialClientes);
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
    const [capturando, setCapturando] = useState<number | null>(null);

    useEffect(() => {
        setClientes(initialClientes);
    }, [initialClientes]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' })
            .format(val)
            .replace('BOB', 'Bs');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setClientes((items) => {
                const oldIndex = items.findIndex((item) => item.cliente_id == active.id);
                const newIndex = items.findIndex((item) => item.cliente_id == over.id);

                if (oldIndex === -1 || newIndex === -1) return items;

                const newItems = arrayMove(items, oldIndex, newIndex);

                if (saveTimeout) clearTimeout(saveTimeout);
                const timeout = setTimeout(() => {
                    guardarOrden(newItems);
                }, 1000);
                setSaveTimeout(timeout);

                return newItems;
            });
        }
    };

    const guardarOrden = (items: Cliente[]) => {
        const orden = items.map((item, index) => ({
            cliente_id: item.cliente_id,
            posicion: index + 1,
            estado: item.estado,
            nota: item.nota,
            hora_estimada: item.hora_estimada,
        }));

        router.post(
            '/rutas',
            { orden },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const cambiarEstado = (clienteId: number, nuevoEstado: string) => {
        router.patch(
            `/rutas/${clienteId}/estado`,
            { estado: nuevoEstado },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const irACobro = (clienteId: number) => {
        router.visit(`/payments/create?cliente_id=${clienteId}`);
    };

    const capturarUbicacion = (clienteId: number, tipo: string) => {
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                router.post(
                    `/rutas/${clienteId}/ubicacion`,
                    {
                        latitud: position.coords.latitude,
                        longitud: position.coords.longitude,
                        tipo: tipo,
                        es_principal: true
                    },
                    {
                        preserveScroll: true,
                    }
                );
            },
            (error) => {
                let msg = 'No se pudo obtener la ubicación.';
                if (error.code === 1) msg = 'Permiso denegado para el GPS.';
                if (error.code !== 3) {
                    alert(msg);
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 0
            }
        );
    };

    const eliminarUbicacion = (ubicacionId: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta ruta GPS?')) {
            return;
        }

        router.delete(`/rutas/ubicacion/${ubicacionId}`, {
            preserveScroll: true,
        });
    };

    const toggleBloqueo = () => {
        router.patch(
            '/rutas/bloquear',
            {},
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ruta de Cobro" />
            <div className="flex flex-col gap-4 p-4 md:p-6 flex-1 bg-gray-50/50 dark:bg-zinc-950">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <MapIcon className="w-7 h-7 text-indigo-600" />
                            Ruta del Día
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(ruta.fecha).toLocaleDateString('es-BO', {
                                dateStyle: 'full',
                            })}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={toggleBloqueo}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm uppercase transition-all ${ruta.bloqueada
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                            }`}
                    >
                        {ruta.bloqueada ? (
                            <>
                                <Lock className="w-4 h-4" /> Bloqueada
                            </>
                        ) : (
                            <>
                                <Unlock className="w-4 h-4" /> Modo Edición
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Pendientes</p>
                        <p className="text-2xl font-black text-orange-600">{stats.count_pendientes}</p>
                        <p className="text-xs font-medium text-gray-500 mt-1">
                            {formatCurrency(stats.total_pendiente)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Pagados</p>
                        <p className="text-2xl font-black text-emerald-600">{stats.count_pagados}</p>
                        <p className="text-xs font-medium text-gray-500 mt-1">{formatCurrency(stats.total_cobrado)}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Más Tarde</p>
                        <p className="text-2xl font-black text-yellow-600">{stats.count_mas_tarde}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Saltados</p>
                        <p className="text-2xl font-black text-gray-600">{stats.count_saltados}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase">
                        Clientes de Hoy ({clientes.length})
                    </h2>

                    {clientes.length > 0 ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext
                                items={clientes.map((c) => c.cliente_id)}
                                strategy={verticalListSortingStrategy}
                                disabled={ruta.bloqueada}
                            >
                                <div className="space-y-3">
                                    {clientes.map((cliente, index) => (
                                        <SortableItem key={cliente.cliente_id} id={cliente.cliente_id}>
                                            <ClienteRutaCard
                                                cliente={cliente}
                                                posicion={index + 1}
                                                onCobrar={() => irACobro(cliente.cliente_id)}
                                                onCambiarEstado={(estado) => cambiarEstado(cliente.cliente_id, estado)}
                                                onCapturarUbicacion={(tipo) => capturarUbicacion(cliente.cliente_id, tipo)}
                                                onEliminarUbicacion={eliminarUbicacion}
                                                bloqueada={ruta.bloqueada}
                                                permissions={auth.permissions}
                                            />
                                        </SortableItem>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <MapIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                                No hay clientes pendientes hoy
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                ¡Todos los cobros del día están al día! 🎉
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
