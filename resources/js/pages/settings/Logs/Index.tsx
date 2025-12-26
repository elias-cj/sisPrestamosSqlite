import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    History,
    User as UserIcon,
    Clock,
    Monitor,
    Globe,
    Database,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    Download,
    FileText,
    Loader2
} from 'lucide-react';
import { useState } from 'react';
import { BreadcrumbItem, PaginationData } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ActivityLog {
    id: number;
    user: {
        id: number;
        name: string;
    } | null;
    model_type: string;
    model_id: number;
    action: 'created' | 'updated' | 'deleted';
    description: string;
    old_values: any;
    new_values: any;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

interface Props {
    logs: PaginationData<ActivityLog>;
    filters: {
        from_date: string;
        to_date: string;
        from_time: string;
        to_time: string;
        search: string;
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configuración', href: '/settings' },
    { title: 'Auditoría de Actividad', href: '/reports/activity-logs' },
];

export default function ActivityLogs({ logs, filters }: Props) {
    const { company } = usePage<any>().props;
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [filterData, setFilterData] = useState({
        from_date: filters.from_date || '',
        to_date: filters.to_date || '',
        from_time: filters.from_time || '',
        to_time: filters.to_time || '',
        search: filters.search || '',
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/reports/activity-logs', filterData, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams(filterData as any).toString();
        window.location.href = `/reports/activity-logs/export?${params}`;
    };

    const handleExportPDF = async () => {
        setIsExportingPDF(true);
        try {
            const params = new URLSearchParams(filterData as any).toString();
            const response = await fetch(`/reports/activity-logs/data?${params}`);
            const data = await response.json();
            const allLogs: ActivityLog[] = data.logs;

            const doc = new jsPDF();

            // Header
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.text(company?.nombre || 'SisPrestamos', 14, 22);

            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text('REPORTE DE AUDITORÍA DE ACTIVIDAD', 14, 30);
            doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 36);

            const tableRows = allLogs.map(log => [
                `${new Date(log.created_at).toLocaleDateString()} ${new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                log.user?.name || 'Sistema',
                log.action.toUpperCase(),
                formatModelName(log.model_type),
                log.description,
                log.ip_address
            ]);

            autoTable(doc, {
                head: [['Fecha y Hora', 'Usuario', 'Acción', 'Módulo', 'Descripción', 'IP']],
                body: tableRows,
                startY: 45,
                theme: 'striped',
                headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 'auto' },
                    5: { cellWidth: 25 }
                }
            });

            doc.save(`Auditoria_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error al generar el PDF. Por favor, intente de nuevo.');
        } finally {
            setIsExportingPDF(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'created': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'updated': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'deleted': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'created': return <Plus className="w-3 h-3" />;
            case 'updated': return <Edit2 className="w-3 h-3" />;
            case 'deleted': return <Trash2 className="w-3 h-3" />;
            default: return null;
        }
    };

    const formatModelName = (modelPath: string) => {
        if (!modelPath) return 'N/A';
        const parts = modelPath.split('\\');
        return parts[parts.length - 1];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Auditoría de Actividad" />

            <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            Auditoría de Actividad
                        </h1>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
                            Seguimiento detallado de todos los cambios realizados en el sistema.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportPDF}
                            disabled={isExportingPDF}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg shadow-red-200/50 dark:shadow-none font-bold text-sm disabled:opacity-50"
                        >
                            {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                            PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-200/50 dark:shadow-none font-bold text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Excel
                        </button>
                        <div className="bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center h-10">
                            <div className="px-3 py-1 text-xs font-bold text-gray-500 dark:text-zinc-400 border-r border-gray-100 dark:border-zinc-800 flex items-center gap-1.5 h-full">
                                <Database className="w-3 h-3" /> {logs.total} Registros
                            </div>
                            <Link
                                href="/settings"
                                className="px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors flex items-center h-full"
                            >
                                Volver a Ajustes
                            </Link>
                        </div>
                    </div>
                </div>

                {/* --- FILTERS --- */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-zinc-800">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Desde Fecha</label>
                            <input
                                type="date"
                                value={filterData.from_date}
                                onChange={e => setFilterData({ ...filterData, from_date: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Hasta Fecha</label>
                            <input
                                type="date"
                                value={filterData.to_date}
                                onChange={e => setFilterData({ ...filterData, to_date: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Desde Hora</label>
                            <input
                                type="time"
                                value={filterData.from_time}
                                onChange={e => setFilterData({ ...filterData, from_time: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Hasta Hora</label>
                            <input
                                type="time"
                                value={filterData.to_time}
                                onChange={e => setFilterData({ ...filterData, to_time: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Buscador</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Acción, módulo..."
                                    value={filterData.search}
                                    onChange={e => setFilterData({ ...filterData, search: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm h-[38px]"
                            >
                                <Filter className="w-4 h-4" />
                                Filtrar
                            </button>
                            <Link
                                href="/reports/activity-logs"
                                className="bg-gray-100 dark:bg-zinc-800 p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center h-[38px] w-[38px]"
                            >
                                <History className="w-4 h-4 text-gray-400" />
                            </Link>
                        </div>
                    </form>
                </div>

                {/* --- LOGS TABLE --- */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Fecha y Hora</th>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Acción</th>
                                    <th className="px-6 py-4">Módulo / ID</th>
                                    <th className="px-6 py-4">Descripción</th>
                                    <th className="px-6 py-4 text-center">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-zinc-500">
                                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400">
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {log.user?.name || 'Sistema'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                                                        <Globe className="w-2.5 h-2.5" /> {log.ip_address}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                {getActionIcon(log.action)}
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
                                                    {formatModelName(log.model_type)}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    ID: #{log.model_id}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-600 dark:text-zinc-400 text-xs font-medium max-w-xs truncate">
                                                {log.description}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all">
                                                <Search className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No hay registros de actividad para mostrar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- PAGINATION --- */}
                    <div className="px-6 py-4 bg-gray-50/50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <span className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                            Mostrando {logs.from}-{logs.to} de {logs.total}
                        </span>

                        <div className="flex gap-1">
                            {logs.prev_page_url ? (
                                <Link
                                    href={logs.prev_page_url}
                                    className="p-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </Link>
                            ) : (
                                <div className="p-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl opacity-50 cursor-not-allowed">
                                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                                </div>
                            )}

                            {logs.next_page_url ? (
                                <Link
                                    href={logs.next_page_url}
                                    className="p-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </Link>
                            ) : (
                                <div className="p-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl opacity-50 cursor-not-allowed">
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
