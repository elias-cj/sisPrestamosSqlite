import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Calendar, DollarSign, User, FileText, CheckCircle, AlertCircle, Clock, Printer, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Préstamos',
        href: '/loans',
    },
    {
        title: 'Detalle',
        href: '#',
    },
];

export default function Show({ loan }: { loan: any }) {
    // Payment Modal State
    const [selectedCuota, setSelectedCuota] = useState<any>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        cuota_id: '',
        monto_pagado: '',
        mora: '0',
    });

    const openPaymentModal = (cuota: any) => {
        setSelectedCuota(cuota);
        setData({
            cuota_id: cuota.id,
            monto_pagado: cuota.estado === 'parcial'
                ? (cuota.monto - (cuota.pagos?.reduce((sum: number, p: any) => sum + parseFloat(p.monto_pagado), 0) || 0)).toFixed(2)
                : cuota.monto,
            mora: '0',
        });
    };

    const closePaymentModal = () => {
        setSelectedCuota(null);
        reset();
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('payments.store'), {
            onSuccess: () => closePaymentModal(),
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExcel = () => {
        const headers = ['Numero', 'Fecha Vencimiento', 'Monto Cuota', 'Pagado', 'Estado', 'Fecha Pago'];
        const rows = loan.cuotas.map((c: any) => {
            const totalPagado = c.pagos?.reduce((acc: number, val: any) => acc + parseFloat(val.monto_pagado), 0) || 0;
            const lastPaymentDate = c.pagos && c.pagos.length > 0 ? new Date(c.pagos[c.pagos.length - 1].created_at).toLocaleDateString() : '-';
            return [
                c.numero_cuota,
                new Date(c.fecha_programada).toLocaleDateString(),
                parseFloat(c.monto).toFixed(2),
                totalPagado.toFixed(2),
                c.estado.toUpperCase(),
                lastPaymentDate
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any[]) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `prestamo_${loan.id}_detalle.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Préstamo #${loan.id}`} />

            <style>{`
                @media print {
                    @page { margin: 10mm; size: auto; }
                    body { background: white; font-size: 11px; -webkit-print-color-adjust: exact; font-family: sans-serif; }
                    
                    /* Hide unnecessary elements */
                    nav, header, button, .no-print, .breadcrumbs { display: none !important; }
                    
                    /* Main Container */
                    .print-full-width { 
                        width: 100% !important; 
                        max-width: none !important; 
                        padding: 0 !important; 
                        margin: 0 !important; 
                        display: block !important; 
                    }
                    
                    /* Header Container - "Adorned" style - Compacted */
                    .shadow-sm { 
                        box-shadow: none !important; 
                        border: 1px solid #000 !important; 
                        border-radius: 8px !important; 
                        padding: 8px !important; /* Reduced padding */
                        margin-bottom: 5px !important; /* Reduced margin */
                        background-color: #fcfcfc !important;
                    }
                    
                    /* Loan # and Date Row - Tighter */
                    .flex.flex-col.md\:flex-row {
                        display: flex !important;
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        border-bottom: 1px solid #eee !important;
                        padding-bottom: 4px !important; /* Reduced padding */
                        margin-bottom: 4px !important; /* Reduced margin */
                    }
                    
                    /* Titles */
                    h1 { font-size: 18px !important; color: #000 !important; margin: 0 !important; }
                    .text-2xl { font-size: 18px !important; }
                    
                    /* Flex Layout for Client/Amount/Conditions - Targeting via custom class now */
                    .print-info-grid {
                        display: flex !important;
                        flex-direction: row !important;
                        flex-wrap: nowrap !important;
                        justify-content: space-between !important;
                        align-items: flex-start !important;
                        gap: 15px !important;
                        width: 100% !important;
                        margin-top: 2px !important; /* Minimal margin */
                        padding-top: 2px !important; /* Minimal padding */
                        border-top: none !important; /* Removed border to save space */
                    }
                    
                    /* Info Sections Styling - Flex items */
                    .print-info-grid > div {
                        flex: 1 !important;
                        border-left: 1px solid #ccc !important;
                        padding-left: 10px !important;
                    }
                    .print-info-grid > div:first-child { border-left: none !important; padding-left: 0 !important; }
                    
                    /* Hide Partners specifically (4th child) */
                    .print-info-grid > div:nth-child(4) { display: none !important; }

                    /* Text Typography */
                    p.uppercase { font-size: 8px !important; color: #666 !important; margin-bottom: 0 !important; font-weight: bold !important; letter-spacing: 0.5px !important; }
                    p.font-semibold, p.font-medium, .text-xl { font-size: 11px !important; color: #000 !important; font-weight: bold !important; line-height: 1.1 !important; }
                    .text-gray-500 { color: #555 !important; font-size: 9px !important; }
                    
                    /* Table - Compact Rows */
                    table { font-size: 9px !important; width: 100% !important; border-collapse: collapse !important; margin-top: 5px !important; }
                    thead { display: table-header-group !important; }
                    tr { page-break-inside: avoid !important; }
                    th { 
                        background-color: #eee !important; /* Lighter background for print */
                        color: #000 !important; 
                        padding: 2px 4px !important; /* Tight padding */
                        text-transform: uppercase !important; 
                        font-size: 8px !important;
                        border-bottom: 1px solid #000 !important;
                    }
                    td { 
                        border-bottom: 1px solid #ddd !important; 
                        padding: 2px 4px !important; /* Tight padding */
                        color: #000 !important;
                    }
                    
                    /* Reduce gap between title and table */
                    .flex.flex-col.gap-6 { gap: 4px !important; }
                    
                    /* Icons - Hide them for cleaner look as requested */
                    svg { display: none !important; }
                }
            `}</style>

            <div className="no-print hidden print:block text-right text-xs text-gray-400 mb-2">
                Impreso el: {new Date().toLocaleString('es-ES')}
            </div>

            <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 print-full-width">

                {/* Header Info */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-zinc-700 pb-6 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-6 h-6 text-indigo-500" />
                                Préstamo #{loan.id}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Creado el {new Date(loan.created_at).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 no-print">
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${loan.estado === 'activo' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                loan.estado === 'cancelado' ? 'bg-green-50 text-green-700 border-green-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                {loan.estado.toUpperCase()}
                            </span>

                            {/* Export Buttons */}
                            <button onClick={handlePrint} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center gap-1">
                                <Printer className="w-5 h-5" />
                            </button>
                            <button onClick={handleExcel} className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg flex items-center gap-1">
                                <FileSpreadsheet className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 print-info-grid">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-zinc-700 rounded-full">
                                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{loan.cliente.nombre}</p>
                                    <p className="text-xs text-gray-500">{loan.cliente.documento}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monto Prestado</p>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-500" />
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    {loan.moneda.simbolo} {parseFloat(loan.monto).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Condiciones</p>
                            <p className="font-medium text-gray-900 dark:text-white">{loan.interes}% Interés</p>
                            <p className="text-sm text-gray-500">{loan.numero_cuotas} Cuotas {loan.tipo_pago}es</p>
                        </div>
                        <div className="no-print col-span-1 md:col-span-2 lg:col-span-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Financiamiento</p>
                            {loan.socios.length === 0 ? (
                                <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                    <span className="text-sm font-bold">100% Empresa</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex -space-x-2">
                                        {loan.socios.map((socio: any) => (
                                            <div key={socio.id} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700" title={`${socio.nombre}: $${parseFloat(socio.pivot.monto_aportado).toLocaleString()}`}>
                                                {socio.nombre.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium">
                                        Socios aportan: ${(loan.socios.reduce((s: number, p: any) => s + parseFloat(p.pivot.monto_aportado), 0)).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Schedule Table */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" /> Cronograma de Pagos
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                            <thead className="bg-gray-50 dark:bg-zinc-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuota</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase no-print">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                {loan.cuotas.map((cuota: any) => {
                                    const totalPagado = cuota.pagos?.reduce((acc: number, val: any) => acc + parseFloat(val.monto_pagado), 0) || 0;
                                    const isPaid = cuota.estado === 'pagado';

                                    return (
                                        <tr key={cuota.id} className={isPaid ? 'bg-green-50/30' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {cuota.numero_cuota}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(cuota.fecha_programada).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                                {loan.moneda.simbolo} {parseFloat(cuota.monto).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {totalPagado > 0 ? `${loan.moneda.simbolo} ${totalPagado.toFixed(2)}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${cuota.estado === 'pagado' ? 'bg-green-100 text-green-800' :
                                                        cuota.estado === 'parcial' ? 'bg-yellow-100 text-yellow-800' :
                                                            new Date(cuota.fecha_programada) < new Date() ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                    }
                                                `}>
                                                    {cuota.estado === 'pagado' && <CheckCircle className="w-3 h-3" />}
                                                    {cuota.estado === 'pendiente' && new Date(cuota.fecha_programada) < new Date() && <AlertCircle className="w-3 h-3" />}
                                                    {cuota.estado.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm no-print">
                                                {!isPaid && (
                                                    <button
                                                        onClick={() => openPaymentModal(cuota)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                    >
                                                        Registrar Pago
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment Modal */}
                {selectedCuota && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Registrar Pago - Cuota #{selectedCuota.numero_cuota}
                            </h3>
                            <form onSubmit={submitPayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto a Pagar</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-lg font-bold"
                                        value={data.monto_pagado}
                                        onChange={e => setData('monto_pagado', e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Faltante: ${(parseFloat(selectedCuota.monto) - (selectedCuota.pagos?.reduce((s: number, p: any) => s + parseFloat(p.monto_pagado), 0) || 0)).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mora / Recargo (Opcional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2"
                                        value={data.mora}
                                        onChange={e => setData('mora', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={closePaymentModal}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                                    >
                                        Confirmar Cobro
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
