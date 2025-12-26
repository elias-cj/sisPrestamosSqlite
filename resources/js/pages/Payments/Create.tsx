import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Banknote, Search, User, Calendar, FileText, CheckCircle, AlertCircle, X, Printer } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cobros', href: '/payments' },
    { title: 'Realizar Cobro', href: '#' },
];

interface Quota {
    id: number;
    numero_cuota: number;
    fecha_programada: string;
    monto: number;
    estado: string;
    pagos: any[];
}

interface Loan {
    id: number;
    monto: number;
    interes: number;
    tipo_pago: string;
    cuotas: Quota[];
}

interface Client {
    id: number;
    nombre: string;
    documento: string;
    prestamos: Loan[];
}

interface PaymentReceipt {
    id: number;
    monto_pagado: number;
    mora: number;
    fecha_pago: string;
    cuota_numero: number;
    prestamo_id: number;
    cliente_nombre: string;
    cliente_documento: string;
    monto_prestamo: number;
    interes: number;
    usuario_nombre: string;
}

export default function Create({ clients, paymentReceipt }: { clients: Client[], paymentReceipt?: PaymentReceipt }) {
    // Debug: Log clients to console
    console.log('Loaded clients:', clients);
    console.log('Total clients:', clients.length);

    const { data, setData, post, processing, errors, reset } = useForm({
        cuota_id: '',
        monto_pagado: '',
        mora: 0,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

    // Payment Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetQuota, setTargetQuota] = useState<Quota | null>(null);

    // Receipt Modal State
    const [showReceipt, setShowReceipt] = useState(!!paymentReceipt);

    // Receipt Reprint State
    const [reprintReceipt, setReprintReceipt] = useState<any>(null);

    // Search Logic
    const filteredClients = searchTerm.length > 0
        ? clients.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.documento.includes(searchTerm))
        : [];

    const handleClientSelect = (client: Client) => {
        setSelectedClient(client);
        setSearchTerm(''); // Clear search to hide dropdown
        // Auto-select first active loan if any
        if (client.prestamos.length > 0) {
            setSelectedLoan(client.prestamos[0]);
        } else {
            setSelectedLoan(null);
        }
    };

    const openPaymentModal = (quota: Quota) => {
        setTargetQuota(quota);
        setData({
            cuota_id: quota.id.toString(),
            monto_pagado: quota.monto.toString(),
            mora: 0
        });
        setIsModalOpen(true);
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('payments.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();

                // Update the quota state reactively without page reload
                if (selectedLoan && targetQuota) {
                    const updatedLoan = {
                        ...selectedLoan,
                        cuotas: selectedLoan.cuotas.map(cuota => {
                            if (cuota.id === targetQuota.id) {
                                // Calculate total paid for this quota
                                const currentPaid = cuota.pagos?.reduce((sum, p) => sum + parseFloat(p.monto_pagado.toString()), 0) || 0;
                                const newPayment = parseFloat(data.monto_pagado);
                                const totalPaid = currentPaid + newPayment;

                                // Determine new state
                                const newState = totalPaid >= cuota.monto ? 'pagado' : 'parcial';

                                return {
                                    ...cuota,
                                    estado: newState,
                                    pagos: [
                                        ...(cuota.pagos || []),
                                        {
                                            id: Date.now(), // Temporary ID
                                            monto_pagado: newPayment,
                                            mora: parseFloat(data.mora.toString()) || 0,
                                            created_at: new Date().toISOString(),
                                            usuario: { name: 'Usuario' }
                                        }
                                    ]
                                };
                            }
                            return cuota;
                        })
                    };

                    setSelectedLoan(updatedLoan);

                    // Also update the client's loans
                    if (selectedClient) {
                        const updatedClient = {
                            ...selectedClient,
                            prestamos: selectedClient.prestamos.map(loan =>
                                loan.id === selectedLoan.id ? updatedLoan : loan
                            )
                        };
                        setSelectedClient(updatedClient);
                    }
                }
            }
        });
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleReprintReceipt = (cuota: Quota) => {
        if (!cuota.pagos || cuota.pagos.length === 0) return;

        // Get the last payment for this quota
        const lastPayment = cuota.pagos[cuota.pagos.length - 1];

        setReprintReceipt({
            id: lastPayment.id,
            monto_pagado: lastPayment.monto_pagado,
            mora: lastPayment.mora || 0,
            fecha_pago: new Date(lastPayment.created_at).toLocaleString('es-ES'),
            cuota_numero: cuota.numero_cuota,
            prestamo_id: selectedLoan?.id || 0,
            monto_prestamo: selectedLoan?.monto || 0,
            interes: selectedLoan?.interes || 0,
            cliente_nombre: selectedClient?.nombre || '',
            cliente_documento: selectedClient?.documento || '',
            usuario_nombre: lastPayment.usuario?.name || 'Sistema'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Realizar Cobro" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">

                {/* Error Display */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-2">
                            <AlertCircle className="w-5 h-5" />
                            Error
                        </div>
                        <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300">
                            {Object.keys(errors).map(key => (
                                <li key={key}>{errors[key as keyof typeof errors]}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 1. Global Search Bar - Integrated at top */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700/50 p-6 relative z-30">
                    <label className="block text-sm font-bold text-gray-700 dark:text-zinc-400 mb-2 uppercase tracking-wider">Buscar Cliente</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Ingrese Nombre o CI/DNI..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-gray-50 dark:bg-zinc-900/50 text-gray-900 dark:text-white text-lg shadow-inner focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {searchTerm.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 mx-6 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 max-h-80 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {filteredClients.length > 0 ? (
                                filteredClients.map(client => (
                                    <button
                                        key={client.id}
                                        onClick={() => handleClientSelect(client)}
                                        className="w-full text-left p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-gray-100 dark:border-zinc-700 last:border-0 transition-colors flex justify-between items-center group"
                                    >
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{client.nombre}</div>
                                            <div className="text-sm text-gray-500">{client.documento}</div>
                                        </div>
                                        <div className="bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-zinc-600">
                                            {client.prestamos.length} Préstamos
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                    <Search className="w-8 h-8 mb-2 opacity-20" />
                                    No se encontraron clientes coincidentes.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Main Integrated Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Left Sidebar: Client & Loans */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Client Card */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700/50 p-8 text-center min-h-[250px] flex flex-col justify-center transition-all">
                            {selectedClient ? (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white dark:border-zinc-700 shadow-sm">
                                        <User className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{selectedClient.nombre}</h2>
                                    <p className="text-gray-500 dark:text-zinc-500 font-mono tracking-widest text-sm">{selectedClient.documento}</p>
                                </div>
                            ) : (
                                <div className="opacity-20 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-5 border-4 border-dashed border-gray-300 dark:border-zinc-700">
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Sin Cliente</p>
                                </div>
                            )}
                        </div>

                        {/* Loans Switcher Card */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700/50 overflow-hidden">
                            <div className="px-5 py-4 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-700/50 font-bold text-xs uppercase tracking-widest text-gray-500">
                                Préstamos Activos
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-zinc-700/50 max-h-[400px] overflow-y-auto">
                                {selectedClient && selectedClient.prestamos.length > 0 ? (
                                    selectedClient.prestamos.map(loan => (
                                        <button
                                            key={loan.id}
                                            onClick={() => setSelectedLoan(loan)}
                                            className={`w-full text-left p-5 transition-all group relative ${selectedLoan?.id === loan.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-zinc-700/30'}`}
                                        >
                                            {selectedLoan?.id === loan.id && (
                                                <div className="absolute inset-y-0 left-0 w-1.5 bg-indigo-600 dark:bg-indigo-500"></div>
                                            )}
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className={`font-black text-lg ${selectedLoan?.id === loan.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-zinc-200'}`}>#{loan.id}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-zinc-900 rounded-md">{loan.tipo_pago}</span>
                                            </div>
                                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-500">$ {parseFloat(loan.monto.toString()).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-xs italic">
                                        No hay préstamos para mostrar
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area: Payment Schedule */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-gray-200 dark:border-zinc-700/50 overflow-hidden min-h-[600px] flex flex-col">
                            {selectedLoan ? (
                                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="p-6 bg-indigo-600 dark:bg-indigo-900/40 text-white flex justify-between items-center">
                                        <h3 className="text-lg font-black flex items-center gap-3 uppercase tracking-wider">
                                            <FileText className="w-6 h-6" />
                                            Plan de Pagos - Préstamo #{selectedLoan.id}
                                        </h3>
                                        <div className="bg-white/10 dark:bg-zinc-900/50 px-4 py-2 rounded-xl text-sm font-black text-indigo-50 border border-white/20">
                                            {selectedLoan.cuotas.filter(c => c.estado === 'pagado').length} / {selectedLoan.cuotas.length} Pagadas
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/80 dark:bg-zinc-900/80 text-[11px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-widest border-b border-gray-200 dark:border-zinc-700/50">
                                                    <th className="px-6 py-4">#</th>
                                                    <th className="px-6 py-4">Fecha Programada</th>
                                                    <th className="px-6 py-4">Monto Cuota</th>
                                                    <th className="px-6 py-4">Estado</th>
                                                    <th className="px-6 py-4 text-center">Comprobante</th>
                                                    <th className="px-6 py-4 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/50">
                                                {selectedLoan.cuotas.map((cuota) => {
                                                    const isPaid = cuota.estado === 'pagado';
                                                    return (
                                                        <tr key={cuota.id} className={`transition-colors ${isPaid ? 'opacity-60 grayscale-[0.5]' : 'hover:bg-gray-50 dark:hover:bg-zinc-700/20'}`}>
                                                            <td className="px-6 py-5 font-black text-gray-900 dark:text-white">{cuota.numero_cuota}</td>
                                                            <td className="px-6 py-5 text-gray-600 dark:text-zinc-400 font-medium">{new Date(cuota.fecha_programada).toLocaleDateString()}</td>
                                                            <td className="px-6 py-5 font-black text-gray-900 dark:text-zinc-200 text-base">$ {parseFloat(cuota.monto.toString()).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-6 py-5">
                                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider 
                                                                    ${isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'}`}>
                                                                    {cuota.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                {isPaid && cuota.pagos && cuota.pagos.length > 0 ? (
                                                                    <button
                                                                        onClick={() => handleReprintReceipt(cuota)}
                                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-[11px] font-black transition-all border border-indigo-200 dark:border-indigo-500/20"
                                                                    >
                                                                        <Printer className="w-3.5 h-3.5" />
                                                                        Imprimir
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-gray-300 dark:text-zinc-700">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-5 text-right">
                                                                {!isPaid ? (
                                                                    <button
                                                                        onClick={() => openPaymentModal(cuota)}
                                                                        className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500/90 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-emerald-500/30 transition-all transform active:scale-95 flex items-center gap-2 ml-auto uppercase tracking-widest"
                                                                    >
                                                                        <Banknote className="w-3.5 h-3.5" /> Cobrar
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-emerald-500 dark:text-emerald-400 font-black text-xs flex items-center justify-end gap-1.5 uppercase tracking-widest">
                                                                        <CheckCircle className="w-4 h-4" /> Pagado
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30 grayscale pointer-events-none">
                                    <div className="w-32 h-32 bg-gray-100 dark:bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-6 border-4 border-dashed border-gray-300 dark:border-zinc-800">
                                        <FileText className="w-16 h-16 text-gray-300 dark:text-zinc-700" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-2">Plan de Pagos</h3>
                                    <p className="text-sm font-medium text-gray-400">Seleccione un préstamo para visualizar la tabla de cuotas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Modal */}
                {isModalOpen && targetQuota && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Banknote className="w-5 h-5" /> Registrar Cobro
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="hover:bg-emerald-700 p-1 rounded-full"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={submitPayment} className="p-6 space-y-4">
                                <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-500 mb-1">Pagando Cuota #{targetQuota.numero_cuota}</p>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                        ${parseFloat(targetQuota.monto.toString()).toFixed(2)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto a Pagar</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 text-lg font-bold"
                                        value={data.monto_pagado}
                                        onChange={e => setData('monto_pagado', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mora / Recargo (Opcional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-600 dark:bg-zinc-900"
                                        value={data.mora}
                                        onChange={e => setData('mora', parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                                    >
                                        Confirmar Pago
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Payment Receipt Modal */}
                {showReceipt && paymentReceipt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                            {/* Print Styles */}
                            <style>{`
                                @media print {
                                    @page { margin: 20px; size: letter; }
                                    body { visibility: hidden; }
                                    .receipt-content { 
                                        visibility: visible;
                                        position: fixed;
                                        top: 0;
                                        left: 0;
                                        width: 100%;
                                        margin: 0;
                                        padding: 20px;
                                        background: white;
                                        z-index: 9999;
                                    }
                                    .receipt-content * {
                                        visibility: visible;
                                    }
                                    .no-print { display: none !important; }
                                }
                            `}</style>

                            <div className="receipt-content bg-white p-8">
                                {/* Header */}
                                <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">COMPROBANTE DE PAGO</h1>
                                    <p className="text-gray-600">Recibo #{paymentReceipt.id.toString().padStart(6, '0')}</p>
                                    <p className="text-sm text-gray-500 mt-1">{paymentReceipt.fecha_pago}</p>
                                </div>

                                {/* Client Info */}
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
                                        <p className="font-bold text-gray-900 text-lg">{paymentReceipt.cliente_nombre}</p>
                                        <p className="text-sm text-gray-600">CI/DNI: {paymentReceipt.cliente_documento}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Préstamo</p>
                                        <p className="font-bold text-gray-900 text-lg">#{paymentReceipt.prestamo_id}</p>
                                        <p className="text-sm text-gray-600">Cuota N° {paymentReceipt.cuota_numero}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Detalles del Préstamo</p>
                                        <p className="text-sm text-gray-600">Monto Prestado: <span className="font-bold text-gray-900">${parseFloat(paymentReceipt.monto_prestamo.toString()).toFixed(2)}</span></p>
                                        <p className="text-sm text-gray-600">Interés: <span className="font-bold text-gray-900">{paymentReceipt.interes}%</span></p>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Monto Pagado</p>
                                            <p className="text-2xl font-bold text-emerald-600">${parseFloat(paymentReceipt.monto_pagado.toString()).toFixed(2)}</p>
                                        </div>
                                        {paymentReceipt.mora > 0 && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Mora/Recargo</p>
                                                <p className="text-2xl font-bold text-orange-600">${parseFloat(paymentReceipt.mora.toString()).toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-gray-300 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-700">TOTAL</span>
                                            <span className="text-3xl font-bold text-gray-900">
                                                ${(parseFloat(paymentReceipt.monto_pagado.toString()) + parseFloat(paymentReceipt.mora.toString())).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-200 pt-4">
                                    <p className="text-xs text-gray-500 text-center">
                                        Recibido por: <span className="font-semibold text-gray-700">{paymentReceipt.usuario_nombre}</span>
                                    </p>

                                    <p className="text-xs text-gray-400 text-center mt-2 font-medium uppercase tracking-widest">
                                        Muchas gracias por preferirnos
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-gray-50 dark:bg-zinc-900 p-4 flex justify-end gap-3 no-print">
                                <button
                                    onClick={() => setShowReceipt(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handlePrintReceipt}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Imprimir
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reprint Receipt Modal */}
                {reprintReceipt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                            <style>{`
                                @media print {
                                    @page { margin: 20px; size: letter; }
                                    body { visibility: hidden; }
                                    .receipt-content { 
                                        visibility: visible;
                                        position: fixed;
                                        top: 0;
                                        left: 0;
                                        width: 100%;
                                        margin: 0;
                                        padding: 20px;
                                        background: white;
                                        z-index: 9999;
                                    }
                                    .receipt-content * {
                                        visibility: visible;
                                    }
                                    .no-print { display: none !important; }
                                }
                            `}</style>

                            <div className="receipt-content bg-white p-8">
                                <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">COMPROBANTE DE PAGO</h1>
                                    <p className="text-gray-600">Recibo #{reprintReceipt.id.toString().padStart(6, '0')}</p>
                                    <p className="text-sm text-gray-500 mt-1">{reprintReceipt.fecha_pago}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
                                        <p className="font-bold text-gray-900 text-lg">{reprintReceipt.cliente_nombre}</p>
                                        <p className="text-sm text-gray-600">CI/DNI: {reprintReceipt.cliente_documento}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Préstamo</p>
                                        <p className="font-bold text-gray-900 text-lg">#{reprintReceipt.prestamo_id}</p>
                                        <p className="text-sm text-gray-600">Cuota N° {reprintReceipt.cuota_numero}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Detalles del Préstamo</p>
                                        <p className="text-sm text-gray-600">Monto Prestado: <span className="font-bold text-gray-900">${parseFloat(reprintReceipt.monto_prestamo.toString()).toFixed(2)}</span></p>
                                        <p className="text-sm text-gray-600">Interés: <span className="font-bold text-gray-900">{reprintReceipt.interes}%</span></p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Monto Pagado</p>
                                            <p className="text-2xl font-bold text-emerald-600">${parseFloat(reprintReceipt.monto_pagado.toString()).toFixed(2)}</p>
                                        </div>
                                        {reprintReceipt.mora > 0 && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Mora/Recargo</p>
                                                <p className="text-2xl font-bold text-orange-600">${parseFloat(reprintReceipt.mora.toString()).toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-gray-300 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-700">TOTAL</span>
                                            <span className="text-3xl font-bold text-gray-900">
                                                ${(parseFloat(reprintReceipt.monto_pagado.toString()) + parseFloat(reprintReceipt.mora.toString())).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <p className="text-xs text-gray-500 text-center">
                                        Recibido por: <span className="font-semibold text-gray-700">{reprintReceipt.usuario_nombre}</span>
                                    </p>

                                    <p className="text-xs text-gray-400 text-center mt-2 font-medium uppercase tracking-widest">
                                        Muchas gracias por preferirnos
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-900 p-4 flex justify-end gap-3 no-print">
                                <button
                                    onClick={() => setReprintReceipt(null)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handlePrintReceipt}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-2"
                                >
                                    <Printer className="w-5 h-5" />
                                    Imprimir
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
