import { Clock, Check, AlertTriangle, Ban } from 'lucide-react';

interface ClienteRutaCardProps {
    cliente: {
        cliente_id: number;
        nombre: string;
        documento: string;
        prestamo_id: number;
        monto_cobrar: number;
        cuotas_pendientes: number;
        dias_mora: number;
        estado: 'pendiente' | 'pagado' | 'mas_tarde' | 'saltado';
        nota?: string;
        hora_estimada?: string;
    };
    posicion: number;
    onCobrar: () => void;
    onCambiarEstado: (estado: string) => void;
    bloqueada: boolean;
}

export default function ClienteRutaCard({
    cliente,
    posicion,
    onCobrar,
    onCambiarEstado,
    bloqueada,
}: ClienteRutaCardProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' })
            .format(val)
            .replace('BOB', 'Bs');
    };

    const getEstadoConfig = (estado: string) => {
        switch (estado) {
            case 'pagado':
                return {
                    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                    border: 'border-emerald-200 dark:border-emerald-800',
                    text: 'text-emerald-700 dark:text-emerald-400',
                    icon: <Check className="w-4 h-4" />,
                    label: 'Pagó',
                };
            case 'mas_tarde':
                return {
                    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                    border: 'border-yellow-200 dark:border-yellow-800',
                    text: 'text-yellow-700 dark:text-yellow-400',
                    icon: <Clock className="w-4 h-4" />,
                    label: 'Más tarde',
                };
            case 'saltado':
                return {
                    bg: 'bg-gray-50 dark:bg-gray-900/20',
                    border: 'border-gray-200 dark:border-gray-700',
                    text: 'text-gray-500 dark:text-gray-400',
                    icon: <Ban className="w-4 h-4" />,
                    label: 'Saltado',
                };
            default: // pendiente
                return {
                    bg: 'bg-orange-50 dark:bg-orange-900/20',
                    border: 'border-orange-200 dark:border-orange-800',
                    text: 'text-orange-700 dark:text-orange-400',
                    icon: <AlertTriangle className="w-4 h-4" />,
                    label: 'Pendiente',
                };
        }
    };

    const config = getEstadoConfig(cliente.estado);

    return (
        <div
            className={`p-2.5 rounded-xl border transition-all hover:shadow-md ${config.bg} ${config.border} ${bloqueada ? 'cursor-default' : 'cursor-move'
                }`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Izquierda: Posición + Nombre */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border shadow-sm flex items-center justify-center">
                        <span className="text-xs font-black text-gray-700 dark:text-white">{posicion}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase truncate">
                                {cliente.nombre}
                            </h3>
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${config.text} bg-white/50 dark:bg-black/20 text-[8px] font-black uppercase`}>
                                {config.icon}
                                {config.label}
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-gray-500 truncate">
                            CI: {cliente.documento} • Préstamo #{cliente.prestamo_id}
                        </p>
                    </div>
                </div>

                {/* Centro: Info Financiera (Compacta) */}
                <div className="flex items-center gap-4 px-3 py-1 bg-white/40 dark:bg-zinc-900/40 rounded-lg border border-white/20">
                    <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase leading-none">Monto</p>
                        <p className="text-xs font-black text-gray-900 dark:text-white">{formatCurrency(cliente.monto_cobrar)}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase leading-none">Mora</p>
                        <p className={`text-xs font-black ${cliente.dias_mora > 0 ? 'text-red-600' : 'text-gray-400'}`}>{cliente.dias_mora}d</p>
                    </div>
                </div>

                {/* Derecha: Acciones (Miniaturizadas) */}
                <div className="flex items-center gap-1.5">
                    <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                        <button
                            onClick={() => onCambiarEstado('pendiente')}
                            disabled={cliente.estado === 'pendiente'}
                            title="Pendiente"
                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${cliente.estado === 'pendiente' ? 'bg-orange-600 text-white shadow-sm' : 'hover:bg-orange-100 text-orange-600'}`}
                        >
                            <AlertTriangle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onCambiarEstado('mas_tarde')}
                            disabled={cliente.estado === 'mas_tarde'}
                            title="Más tarde"
                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${cliente.estado === 'mas_tarde' ? 'bg-yellow-600 text-white shadow-sm' : 'hover:bg-yellow-100 text-yellow-600'}`}
                        >
                            <Clock className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onCambiarEstado('saltado')}
                            disabled={cliente.estado === 'saltado'}
                            title="Saltar"
                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${cliente.estado === 'saltado' ? 'bg-gray-600 text-white shadow-sm' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                            <Ban className="w-4 h-4" />
                        </button>
                    </div>

                    {cliente.estado !== 'pagado' && (
                        <button
                            onClick={onCobrar}
                            className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1"
                        >
                            Cobrar
                        </button>
                    )}
                </div>
            </div>

            {/* Nota discreta */}
            {cliente.nota && (
                <div className="mt-1.5 pl-10">
                    <p className="text-[10px] text-gray-500 italic flex items-center gap-1">
                        <span className="opacity-50">📝</span> {cliente.nota}
                    </p>
                </div>
            )}
        </div>
    );
}
