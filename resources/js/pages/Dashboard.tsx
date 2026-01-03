
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    DollarSign,
    TrendingUp,
    Users,
    CreditCard,
    Activity,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    ChevronRight,
    TrendingDown
} from 'lucide-react';
import { useState } from 'react';
import { EvolutionChart, StatusPieChart } from './DashboardCharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

function CompactStatCard({ title, value, icon, subtitle, colorClass }: any) {
    return (
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${colorClass.bg} shrink-0`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{title}</p>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight truncate">{value}</h3>
                    {subtitle && <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({
    stats,
    evolutionData,
    rankingMora,
    loansStatus,
    actividadReciente,
    alerts,
    qrAlert,
    caja,
    filters
}: any) {

    const [period, setPeriod] = useState(filters.period);
    const [customStart, setCustomStart] = useState(filters.start_date);
    const [customEnd, setCustomEnd] = useState(filters.end_date);

    const applyFilter = (newPeriod: string, start?: string, end?: string) => {
        router.get(route('dashboard'), {
            period: newPeriod,
            start_date: start || customStart,
            end_date: end || customEnd
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setPeriod(val);
        if (val !== 'custom') applyFilter(val);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(val).replace('BOB', 'Bs');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel Principal" />
            <div className="flex flex-col gap-4 p-4 md:p-6 flex-1 bg-gray-50/50 dark:bg-zinc-950">

                {/* --- HEADER CON FILTROS Y BOTONES --- */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Centro de Control</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{filters.period.replace('_', ' ')}</span>
                                <p className="text-[10px] text-gray-400 font-medium hidden sm:inline">{new Date(filters.start_date).toLocaleDateString()} - {new Date(filters.end_date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 items-center w-full sm:w-auto">
                            <button onClick={() => router.visit('/loans/create')} className="flex-1 sm:flex-none h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5" /> <span>Préstamo</span>
                            </button>
                            <button onClick={() => router.visit('/payments/create')} className="flex-1 sm:flex-none h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" /> <span>Pago</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <select
                            value={period}
                            onChange={handlePeriodChange}
                            className="bg-white dark:bg-zinc-800 border-none rounded-xl text-xs font-bold text-gray-500 shadow-sm focus:ring-2 focus:ring-indigo-500 h-9 px-3 w-full sm:w-auto"
                        >
                            <option value="daily">Diario</option>
                            <option value="weekly">Esta Semana</option>
                            <option value="monthly">Este Mes</option>
                            <option value="quarterly">Trimestre</option>
                            <option value="annual">Este Año</option>
                            <option value="custom">Personalizado</option>
                        </select>

                        {period === 'custom' && (
                            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 p-1 px-2 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 h-9 w-full sm:w-auto">
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="border-none text-[10px] font-bold p-0 bg-transparent dark:text-white focus:ring-0 flex-1"
                                />
                                <span className="text-gray-300 font-bold">-</span>
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="border-none text-[10px] font-bold p-0 bg-transparent dark:text-white focus:ring-0 flex-1"
                                />
                                <button
                                    onClick={() => applyFilter('custom')}
                                    className="ml-1 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- KPI CARDS COMPACTAS (RESPONSIVE) --- */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    <CompactStatCard
                        title="Capital Prestado"
                        value={formatCurrency(stats.capital_prestado)}
                        icon={<CreditCard className="w-4 h-4 text-indigo-600" />}
                        subtitle={`${stats.crecimiento >= 0 ? '+' : ''}${stats.crecimiento}% cap. sacado de caja`}
                        colorClass={{ bg: 'bg-indigo-50' }}
                    />
                    <CompactStatCard
                        title="Cobrado"
                        value={formatCurrency(stats.ganancias_netas + (evolutionData.reduce((sum: number, d: any) => sum + d.monto_cobrado, 0)))}
                        icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
                        subtitle="total cap. prestado + total interes recuperado"
                        colorClass={{ bg: 'bg-emerald-50' }}
                    />
                    <CompactStatCard
                        title="Prestado En Calle"
                        value={formatCurrency(stats.capital_en_calle)}
                        icon={<Activity className="w-4 h-4 text-amber-600" />}
                        subtitle="Capital comprometido"
                        colorClass={{ bg: 'bg-amber-50' }}
                    />
                    <CompactStatCard
                        title="Utilidad"
                        value={formatCurrency(stats.ganancias_netas)}
                        icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
                        subtitle="(cap. recuperado + interes) - gastos"
                        colorClass={{ bg: 'bg-purple-50' }}
                    />
                    <CompactStatCard
                        title="Inversores"
                        value={stats.socios_activos}
                        icon={<Users className="w-4 h-4 text-blue-600" />}
                        subtitle="Socios activos"
                        colorClass={{ bg: 'bg-blue-50' }}
                    />
                </div>

                {/* --- MAIN GRID: GRÁFICO + VENCIMIENTOS + CAJA --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

                    {/* GRÁFICO DE FLUJO (2 COLUMNAS) */}
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                            <h3 className="text-sm sm:text-base font-black text-gray-800 dark:text-white tracking-tight uppercase">Flujo de Caja</h3>
                            <div className="flex gap-2 sm:gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Prestado</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Cobrado</span>
                                </div>
                            </div>
                        </div>
                        <EvolutionChart data={evolutionData} />
                    </div>

                    {/* CAJA ACTUAL (1 COLUMNA) */}
                    <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm sm:text-base font-black text-gray-800 dark:text-white tracking-tight uppercase">Caja Actual</h3>
                            {caja && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase">Abierta</span>}
                        </div>

                        {caja ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                                    <p className="text-[9px] font-bold uppercase text-white/70 mb-1 tracking-wider">Saldo Disponible</p>
                                    <h4 className="text-2xl font-black tracking-tight">{formatCurrency(caja.saldo_actual)}</h4>
                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                                        <div>
                                            <p className="text-[8px] font-bold text-white/50 uppercase">Apertura</p>
                                            <p className="text-xs font-black">{formatCurrency(caja.monto_apertura)}</p>
                                        </div>
                                        <div className="h-5 w-px bg-white/10"></div>
                                        <div>
                                            <p className="text-[8px] font-bold text-white/50 uppercase">Ingresos</p>
                                            <p className="text-xs font-black text-emerald-400">+{formatCurrency(caja.ingresos_hoy - caja.mora_hoy)}</p>
                                        </div>
                                        <div className="h-5 w-px bg-white/10"></div>
                                        <div>
                                            <p className="text-[8px] font-bold text-white/50 uppercase">Mora</p>
                                            <p className="text-xs font-black text-amber-400">+{formatCurrency(caja.mora_hoy)}</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => router.visit('/cash')} className="w-full py-2 bg-gray-50 dark:bg-zinc-950 hover:bg-gray-100 transition-colors rounded-lg text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 tracking-wider border border-gray-100 dark:border-zinc-700 flex items-center justify-center gap-1.5">
                                    <ChevronRight className="w-3.5 h-3.5" /> Gestionar
                                </button>
                            </div>
                        ) : (
                            <div className="py-6 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <Wallet className="w-5 h-5 text-gray-300" />
                                </div>
                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase mb-1">Caja Cerrada</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-3">Abre caja para operar</p>
                                <button onClick={() => router.visit('/cash')} className="px-5 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider">Abrir</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ALERTA DE QR VENCIMIENTO --- */}
                {qrAlert && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/30">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest">Alerta de Seguridad: QR de Pagos</h4>
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">{qrAlert.mensaje}</p>
                        </div>
                        <button
                            onClick={() => router.visit('/settings')}
                            className="px-4 py-2 bg-amber-900 dark:bg-amber-500 text-white dark:text-amber-950 text-[10px] font-black uppercase rounded-lg shadow-sm active:scale-95 transition-all"
                        >
                            Actualizar QR
                        </button>
                    </div>
                )}

                {/* --- VENCIMIENTOS HOY + ÚLTIMOS PAGOS + MORA --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* VENCIMIENTOS HOY */}
                    <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/20">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black text-red-600 tracking-tight uppercase">Vencen Hoy</h3>
                            <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-full">{alerts.length}</span>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {alerts.length > 0 ? alerts.map((a: any, i: number) => (
                                <div key={i} className="p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex justify-between items-center group hover:bg-red-100/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase truncate tracking-tight">{a.cliente}</p>
                                        <p className="text-[9px] font-bold text-red-600/80 uppercase">Pendiente</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-red-700 dark:text-red-400">{formatCurrency(a.monto)}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-6 flex flex-col items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
                                    <p className="text-xs font-bold text-gray-400 uppercase">Sin vencimientos</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ÚLTIMOS PAGOS */}
                    <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700">
                        <h3 className="text-sm font-black text-gray-800 dark:text-white tracking-tight uppercase mb-4">Últimos Pagos</h3>
                        <div className="space-y-3 max-h-[200px] overflow-y-auto">
                            {actividadReciente.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-2.5 group">
                                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase truncate tracking-tight">{p.cliente}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">{p.fecha}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-emerald-600 tracking-tight">+{formatCurrency(p.monto)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SEMÁFORO DE MORA */}
                    <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700">
                        <h3 className="text-sm font-black text-gray-800 dark:text-white tracking-tight uppercase mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Mora Crítica
                        </h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {rankingMora.length > 0 ? rankingMora.slice(0, 3).map((m: any, i: number) => (
                                <div key={i} className={`p-3 rounded-xl border ${m.riesgo === 'red' ? 'bg-red-50/50 border-red-100 text-red-900' :
                                    m.riesgo === 'orange' ? 'bg-orange-50/50 border-orange-100 text-orange-900' :
                                        'bg-yellow-50/50 border-yellow-100 text-yellow-900'
                                    }`}>
                                    <div className="flex justify-between items-start mb-1.5">
                                        <p className="font-black text-xs uppercase truncate pr-2">{m.cliente}</p>
                                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${m.riesgo === 'red' ? 'bg-red-500' : m.riesgo === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
                                            }`} />
                                    </div>
                                    <p className="text-lg font-black tracking-tight mb-0.5">{formatCurrency(m.monto)}</p>
                                    <p className="text-[9px] font-bold uppercase opacity-70 flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" /> {m.dias} días
                                    </p>
                                </div>
                            )) : (
                                <div className="py-6 flex flex-col items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
                                    <p className="text-xs font-bold text-gray-400 uppercase">Sin mora</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}

