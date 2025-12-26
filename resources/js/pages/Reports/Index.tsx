import React, { FormEvent, ChangeEvent, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Printer,
    FileDown,
    Users,
    Wallet,
    Briefcase,
    Calendar,
    Search,
    Filter,
    LayoutDashboard,
    PieChart,
    Eye,
    X,
    User
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reportes',
        href: '/reports',
    },
];

export default function Index({
    filters,
    stats,
    sociosBalance,
    partnersProfit,
    totalsProfit
}: {
    filters: any,
    stats: any,
    sociosBalance: any[],
    partnersProfit: any[],
    totalsProfit: any
}) {
    const [activeTab, setActiveTab] = useState('summary');
    const [selectedSocio, setSelectedSocio] = useState<any>(null);

    const { data: globalData, setData: setGlobalData, get: getGlobal } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
        balance_search_name: filters.balance_search_name || '',
        balance_search_doc: filters.balance_search_doc || '',
    });

    const { data: profitData, setData: setProfitData, get: getProfit } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
        socio_search: filters.socio_search || '',
    });

    const filterGlobal = (e: FormEvent) => {
        e.preventDefault();
        getGlobal(route('reports.index'), { preserveState: true, preserveScroll: true });
    };

    const filterProfit = (e: FormEvent) => {
        e.preventDefault();
        getProfit(route('reports.index'), { preserveState: true, preserveScroll: true });
    };

    const handlePrint = () => window.print();

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        if (activeTab === 'summary') {
            csvContent += "Socio,Documento,Capital Inicial,Disponible,Comprometido,Ganancia Acumulada\n";
            sociosBalance.forEach(s => {
                csvContent += `${s.nombre},${s.documento},${s.capital_inicial},${s.capital_disponible},${s.capital_comprometido},${s.ganancias_acumuladas}\n`;
            });
        } else {
            csvContent += "Socio,Capital Prestado,Ganancia Socio,Mi Ganancia,Total Generado\n";
            partnersProfit.forEach(p => {
                csvContent += `${p.nombre},${p.capital_prestado},${p.ganancia_socio},${p.mi_ganancia},${p.total_generado}\n`;
            });
        }
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_${activeTab === 'summary' ? 'balance' : 'ganancias'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(num).replace('BOB', 'Bs');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes Financieros" />
            <div className="p-3 md:p-5 max-w-[1600px] mx-auto space-y-4">

                {/* --- PRINT HEADER --- */}
                <div className="print-header">
                    <h1>SISTEMA DE PRÉSTAMOS - REPORTE DE {activeTab === 'summary' ? 'BALANCE GENERAL' : 'GANANCIAS'}</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                        Periodo: {filters.start_date} al {filters.end_date}
                    </p>
                    <div className="mt-4 border-b-2 border-black"></div>
                </div>

                {/* --- NAVIGATION TABS --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 no-print">
                    <div className="flex p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-tight ${activeTab === 'summary'
                                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-zinc-700'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
                                }`}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Resumen Financiero
                        </button>
                        <button
                            onClick={() => setActiveTab('profit')}
                            className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-tight ${activeTab === 'profit'
                                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-zinc-700'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
                                }`}
                        >
                            <PieChart className="w-3.5 h-3.5" />
                            Ganancias por Socio
                        </button>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(activeTab === 'summary' ? globalData : profitData).toString();
                                window.location.href = route('reports.export.excel') + '?' + params;
                            }}
                            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow shadow-emerald-600/10"
                        >
                            <FileDown className="w-3.5 h-3.5" /> Exportar Excel (.xlsx)
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex-1 md:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow shadow-red-600/10"
                        >
                            <Printer className="w-3.5 h-3.5" /> Generar PDF
                        </button>
                    </div>
                </div>

                <div className="transition-all duration-300">
                    {/* --- TAB 1: RESUMEN GENERAL --- */}
                    {activeTab === 'summary' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            {/* Filtros de Resumen / Balance */}
                            <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm no-print">
                                <form onSubmit={filterGlobal} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                    <div className="w-full">
                                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Desde</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="date"
                                                className="pl-9 py-2 rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-xs font-bold w-full focus:ring-1 focus:ring-indigo-500 transition-all border-none"
                                                value={globalData.start_date}
                                                onChange={(e) => setGlobalData(data => ({ ...data, start_date: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Hasta</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="date"
                                                className="pl-9 py-2 rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-xs font-bold w-full focus:ring-1 focus:ring-indigo-500 transition-all border-none"
                                                value={globalData.end_date}
                                                onChange={(e) => setGlobalData(data => ({ ...data, end_date: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Nombre del Socio</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Ej: Elias..."
                                                className="pl-9 py-2 rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-xs font-bold w-full focus:ring-1 focus:ring-indigo-500 transition-all border-none"
                                                value={globalData.balance_search_name}
                                                onChange={(e) => setGlobalData(data => ({ ...data, balance_search_name: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Documento</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="CI/NIT..."
                                                className="pl-9 py-2 rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-xs font-bold w-full focus:ring-1 focus:ring-indigo-500 transition-all border-none"
                                                value={globalData.balance_search_doc}
                                                onChange={(e) => setGlobalData(data => ({ ...data, balance_search_doc: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-black transition-all shadow shadow-indigo-600/20 uppercase text-[10px] tracking-widest">
                                        Filtrar
                                    </button>
                                </form>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Prestado', value: stats.total_lent, sub: `${stats.loans_count} préstamos`, color: 'text-blue-600', icon: Briefcase, iconColor: 'bg-blue-50 text-blue-600' },
                                    { label: 'Total Cobrado', value: stats.total_collected, badge: 'Ingresos', color: 'text-emerald-600', icon: TrendingUp, iconColor: 'bg-emerald-50 text-emerald-600' },
                                    { label: 'Gastos Ejecutados', value: stats.total_expenses, badge: 'Egresos', color: 'text-red-600', icon: TrendingDown, iconColor: 'bg-red-50 text-red-600' },
                                    { label: 'Flujo Caja Neto', value: stats.net_flow, sub: 'Utilidad bruta', color: 'text-indigo-600', icon: Wallet, iconColor: 'bg-indigo-50 text-indigo-600' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${s.iconColor} dark:bg-zinc-900 flex-shrink-0`}>
                                                <s.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                                                <p className={`text-xl font-black mt-0.5 tracking-tight ${s.color}`}>{formatCurrency(s.value)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            {s.sub ? <p className="text-[9px] text-gray-400 font-bold uppercase">{s.sub}</p> : <div></div>}
                                            {s.badge && (
                                                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${s.badge === 'Ingresos' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {s.badge}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
                                <div className="p-5 border-b border-gray-50 dark:border-zinc-700 flex justify-between items-center">
                                    <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tighter">Balance de Capital de Socios</h3>
                                    <span className="text-[10px] font-bold text-gray-400 italic">Estado consolidado</span>
                                </div>
                                <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 dark:bg-zinc-900/50 font-black text-[9px] uppercase text-gray-400 tracking-widest border-b border-gray-100 dark:border-zinc-700 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4">Socio</th>
                                                <th className="px-6 py-4 text-right">Capital Inicial</th>
                                                <th className="px-6 py-4 text-right">Disponible</th>
                                                <th className="px-6 py-4 text-right">En Calle</th>
                                                <th className="px-6 py-4 text-right">G. Acumulada</th>
                                                <th className="px-6 py-4 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-700 font-bold text-xs">
                                            {sociosBalance.map((s) => (
                                                <tr key={s.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/5 transition-colors group">
                                                    <td className="px-6 py-4 text-gray-900 dark:text-white uppercase tracking-tighter font-black">
                                                        {s.nombre}
                                                        <div className="text-[8px] text-gray-400 font-normal">{s.documento}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-gray-500 font-medium">{formatCurrency(s.capital_inicial)}</td>
                                                    <td className="px-6 py-4 text-right text-emerald-600 font-black">{formatCurrency(s.capital_disponible)}</td>
                                                    <td className="px-6 py-4 text-right text-blue-600 font-bold">{formatCurrency(s.capital_comprometido)}</td>
                                                    <td className="px-6 py-4 text-right text-gray-900 dark:text-gray-300 font-black">{formatCurrency(s.ganancias_acumuladas)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => setSelectedSocio(s)}
                                                            className="p-1.5 bg-indigo-50 text-indigo-600 dark:bg-zinc-900 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors"
                                                            title="Ver Cartera de Clientes"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: GANANCIAS POR SOCIOS --- */}
                    {activeTab === 'profit' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm no-print">
                                <form onSubmit={filterProfit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Desde</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="date"
                                                className="pl-9 py-2 rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-xs font-bold w-full focus:ring-1 focus:ring-indigo-500 transition-all border-none"
                                                value={profitData.start_date}
                                                onChange={(e) => setProfitData(data => ({ ...data, start_date: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Hasta</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="date"
                                                className="pl-9 py-2 rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-xs font-bold w-full focus:ring-1 focus:ring-indigo-500 transition-all border-none"
                                                value={profitData.end_date}
                                                onChange={(e) => setProfitData(data => ({ ...data, end_date: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Buscar Socio</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Nombre del socio..."
                                                className="pl-9 py-2 rounded-xl border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-xs font-bold w-full focus:ring-1 focus:ring-indigo-500 transition-all border-none"
                                                value={profitData.socio_search}
                                                onChange={(e) => setProfitData(data => ({ ...data, socio_search: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-black transition-all shadow shadow-indigo-600/20 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                                        <Filter className="w-3.5 h-3.5" /> Filtrar
                                    </button>
                                </form>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Capital Prestado', value: totalsProfit.capital_prestado, icon: Wallet, iconColor: 'bg-blue-50 text-blue-600', color: 'text-gray-900 dark:text-white' },
                                    { label: 'Ganancia Socios', value: totalsProfit.ganancia_socio, icon: TrendingUp, iconColor: 'bg-emerald-50 text-emerald-600', color: 'text-emerald-600' },
                                    { label: 'Mi Ganancia (Emp)', value: totalsProfit.mi_ganancia, icon: DollarSign, iconColor: 'bg-indigo-50 text-indigo-600', color: 'text-indigo-600' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${s.iconColor} dark:bg-zinc-900`}>
                                            <s.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{s.label}</p>
                                            <p className={`text-2xl font-black tracking-tight ${s.color}`}>{formatCurrency(s.value)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
                                <div className="overflow-x-auto overflow-y-auto max-h-[450px]">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 dark:bg-zinc-900/50 font-black text-[9px] uppercase text-gray-400 tracking-widest border-b border-gray-100 dark:border-zinc-700 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-7 py-5">Socio</th>
                                                <th className="px-7 py-5 text-center">% Rent.</th>
                                                <th className="px-7 py-5 text-right">Inv. Periodo</th>
                                                <th className="px-7 py-5 text-right">Rent. Socio</th>
                                                <th className="px-7 py-5 text-right">Comisión Dueño</th>
                                                <th className="px-7 py-5 text-right">Interés Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-700 font-bold text-xs">
                                            {partnersProfit.map((p) => (
                                                <tr key={p.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/5 transition-colors group">
                                                    <td className="px-7 py-6 text-gray-900 dark:text-white uppercase tracking-tighter font-black">{p.nombre}</td>
                                                    <td className="px-7 py-6 text-center text-gray-400 font-bold">{p.porcentaje_socio}%</td>
                                                    <td className="px-7 py-6 text-right text-gray-500 font-medium">{formatCurrency(p.capital_prestado)}</td>
                                                    <td className="px-7 py-6 text-right text-emerald-600 font-black tracking-tighter">{formatCurrency(p.ganancia_socio)}</td>
                                                    <td className="px-7 py-6 text-right text-indigo-600 font-bold">{formatCurrency(p.mi_ganancia)}</td>
                                                    <td className="px-7 py-6 text-right text-gray-900 dark:text-white font-black tracking-tighter bg-gray-50/10 dark:bg-zinc-900/10">{formatCurrency(p.total_generado)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-zinc-900 text-white font-black border-t border-zinc-800 text-xs sticky bottom-0">
                                            <tr>
                                                <td className="px-7 py-5 uppercase tracking-widest text-zinc-500">Totales Periodo</td>
                                                <td className="px-7 py-5 text-right text-zinc-300">{formatCurrency(totalsProfit.capital_prestado)}</td>
                                                <td className="px-7 py-5 text-right text-emerald-400 tracking-tighter">{formatCurrency(totalsProfit.ganancia_socio)}</td>
                                                <td className="px-7 py-5 text-right text-indigo-400">{formatCurrency(totalsProfit.mi_ganancia)}</td>
                                                <td className="px-7 py-5 text-right text-white text-base tracking-tighter">{formatCurrency(totalsProfit.total_generado)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL DETALLE CARTERA --- */}
            {selectedSocio && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-zinc-700">
                        <div className="p-6 border-b border-gray-50 dark:border-zinc-700 flex justify-between items-center bg-indigo-600 text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter">{selectedSocio.nombre}</h3>
                                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Cartera de Clientes / CI: {selectedSocio.documento}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSocio(null)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            {selectedSocio.portfolio && selectedSocio.portfolio.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 dark:bg-zinc-900/50 font-black text-[9px] uppercase text-gray-400 tracking-widest border-b border-gray-100 dark:border-zinc-700">
                                        <tr>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4 text-right">Inversión Socio</th>
                                            <th className="px-6 py-4 text-right">Monto Préstamo</th>
                                            <th className="px-6 py-4 text-center">Estado</th>
                                            <th className="px-6 py-4 text-right">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-zinc-700 font-bold text-xs text-gray-700 dark:text-zinc-300">
                                        {selectedSocio.portfolio.map((p: any) => (
                                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">{p.cliente}</div>
                                                    <div className="text-[9px] text-gray-400 font-normal">{p.documento}</div>
                                                </td>
                                                <td className="px-6 py-5 text-right text-indigo-600 font-black">{formatCurrency(p.monto_aportado)}</td>
                                                <td className="px-6 py-5 text-right text-gray-500 font-medium">{formatCurrency(p.monto_total)}</td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${p.estado === 'activo' ? 'bg-blue-100 text-blue-700' :
                                                        p.estado === 'cancelado' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {p.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right text-gray-400 font-medium">{p.fecha}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400 italic">
                                    <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Este socio no tiene préstamos registrados aún.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-zinc-900/50 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-700">
                            <div className="mr-auto flex gap-6">
                                <div>
                                    <p className="text-[9px] text-gray-400 font-black uppercase">Capital Comprometido</p>
                                    <p className="text-lg font-black text-blue-600">{formatCurrency(selectedSocio.capital_comprometido)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-400 font-black uppercase">Ganancia Generada</p>
                                    <p className="text-lg font-black text-indigo-600">{formatCurrency(selectedSocio.ganancias_acumuladas)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSocio(null)}
                                className="px-6 py-2.5 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-300 transition-colors"
                            >
                                Cerrar Detalle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                    @media print {
                        .no-print, header, nav, aside, button, .pagination {
                            display: none !important;
                        }
                        body {
                            background: white !important;
                            color: black !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .bg-white, .bg-gray-50, .bg-gray-100 {
                            background: transparent !important;
                        }
                        .text-white {
                            color: black !important;
                        }
                        .shadow-sm, .shadow-lg, .shadow-2xl {
                            box-shadow: none !important;
                        }
                        .border {
                            border: 1px solid #eee !important;
                        }
                        .p-3, .p-5, .p-6 {
                            padding: 0.5rem !important;
                        }
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                        }
                        th, td {
                            border: 1px solid #eee !important;
                            padding: 8px !important;
                            font-size: 10px !important;
                        }
                        .animate-in {
                            animation: none !important;
                        }
                        .max-h-[400px], .max-h-[450px], .max-h-[70vh] {
                            max-height: none !important;
                            overflow: visible !important;
                        }
                        /* Forzar tarjetas en fila en impresión */
                        .grid-cols-1 {
                            display: flex !important;
                            flex-direction: row !important;
                            flex-wrap: nowrap !important;
                            gap: 10px !important;
                            width: 100% !important;
                        }
                        .grid-cols-1 > div {
                            flex: 1 !important;
                            margin: 0 !important;
                            padding: 10px !important;
                            min-width: 0 !important;
                        }
                        .print-header {
                            display: block !important;
                            margin-bottom: 2rem;
                            text-align: center;
                        }
                        .print-header h1 {
                            font-size: 20px;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                    }
                    @media screen {
                        .print-header {
                            display: none;
                        }
                    }
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}
            </style>
        </AppLayout>
    );
}
