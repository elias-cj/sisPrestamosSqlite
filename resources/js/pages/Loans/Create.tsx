import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Préstamos',
        href: '/loans',
    },
    {
        title: 'Nuevo',
        href: '/loans/create',
    },
];

interface Investor {
    socio_id: string;
    monto: string | number;
    porcentaje: number;
}

interface LoanFormData {
    cliente_id: string;
    moneda_id: string;
    monto: string;
    interes: string | number;
    tipo_pago: string;
    numero_cuotas: string | number;
    fecha_inicio: string;
    investors: Investor[];
    auto_assign: boolean;
}

export default function Create({ clients, partners, currencies }: { clients: any[], partners: any[], currencies: any[] }) {
    const { data, setData, post, processing, errors } = useForm<LoanFormData>({
        cliente_id: '',
        moneda_id: currencies.length > 0 ? currencies[0].id : '',
        monto: '',
        interes: 20,
        tipo_pago: 'mensual',
        numero_cuotas: 12,
        fecha_inicio: new Date().toISOString().split('T')[0],
        investors: [],
        auto_assign: true,
    });

    const [calculatedQuota, setCalculatedQuota] = useState(0);
    const [clientSearch, setClientSearch] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);

    // Calculate Quota Preview and Sync Investors
    useEffect(() => {
        const monto = parseFloat(data.monto) || 0;
        const interes = parseFloat(data.interes.toString()) || 0;
        const cuotas = parseInt(data.numero_cuotas.toString()) || 1;

        if (monto > 0 && cuotas > 0) {
            const totalInteres = monto * (interes / 100);
            const total = monto + totalInteres;
            setCalculatedQuota(total / cuotas);
        } else {
            setCalculatedQuota(0);
        }

        // Sync investors amount to match loan amount (100% assignment)
        if (data.investors.length > 0) {
            const updatedInvestors = data.investors.map(inv => ({
                ...inv,
                monto: monto,
                porcentaje: 100
            }));
            // Only update if actually different to avoid infinite loop
            if (JSON.stringify(updatedInvestors) !== JSON.stringify(data.investors)) {
                setData('investors', updatedInvestors);
            }
        }
    }, [data.monto, data.interes, data.numero_cuotas, data.investors.length]);

    const addInvestor = () => {
        if (data.investors.length >= 1) return; // Only 1 partner allowed for 100% coverage
        setData('investors', [{ socio_id: '', monto: data.monto, porcentaje: 100 }]);
    };

    const removeInvestor = (index: number) => {
        const newInvestors = [...data.investors];
        newInvestors.splice(index, 1);
        setData('investors', newInvestors);
    };

    const updateInvestor = (index: number, field: keyof Investor, value: any) => {
        const newInvestors = [...data.investors];
        // Safe update with type handling
        if (field === 'monto') {
            newInvestors[index] = { ...newInvestors[index], monto: value };
            // Recalculate percentage
            const loanAmount = parseFloat(data.monto) || 0;
            if (loanAmount > 0) {
                newInvestors[index].porcentaje = (parseFloat(value) / loanAmount) * 100;
            }
        } else {
            newInvestors[index] = { ...newInvestors[index], [field]: value };
        }

        setData('investors', newInvestors);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation: Sum of investors amount must not exceed loan amount
        const totalInvested = data.investors.reduce((sum, inv) => sum + Number(inv.monto), 0);
        const loanAmount = parseFloat(data.monto);

        if (totalInvested > loanAmount + 0.1) {
            alert(`El monto aportado por los socios ($${totalInvested}) no puede exceder el monto del préstamo ($${loanAmount}).`);
            return;
        }

        post(route('loans.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Préstamo" />
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Registrar Nuevo Préstamo</h2>

                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-2">
                                <span className="text-lg">⚠️</span> Error al Guardar
                            </div>
                            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300">
                                {Object.keys(errors).map(key => (
                                    <li key={key}>{errors[key as keyof typeof errors]}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-8">

                        {/* Section 1: Loan Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 relative">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar Cliente (Nombre o Carnet)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 pl-10"
                                        placeholder="Escriba para buscar..."
                                        value={clientSearch}
                                        onChange={e => {
                                            setClientSearch(e.target.value);
                                            setShowClientDropdown(true);
                                            if (e.target.value === '') setData('cliente_id', '');
                                        }}
                                        onFocus={() => setShowClientDropdown(true)}
                                    />
                                    <div className="absolute left-3 top-2.5 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                {showClientDropdown && clientSearch && (
                                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                        {clients.filter(c =>
                                            c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                            c.documento.includes(clientSearch)
                                        ).length > 0 ? (
                                            clients.filter(c =>
                                                c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                                c.documento.includes(clientSearch)
                                            ).map(client => (
                                                <div
                                                    key={client.id}
                                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-gray-900 dark:text-gray-200"
                                                    onClick={() => {
                                                        setData('cliente_id', client.id);
                                                        setClientSearch(`${client.nombre} - ${client.documento}`);
                                                        setShowClientDropdown(false);
                                                    }}
                                                >
                                                    <span className="block truncate font-medium">{client.nombre}</span>
                                                    <span className="block truncate text-xs text-gray-500">{client.documento}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-700 dark:text-gray-400">
                                                No se encontraron resultados.
                                            </div>
                                        )}
                                    </div>
                                )}
                                {errors.cliente_id && <p className="mt-1 text-sm text-red-600">{errors.cliente_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto del Préstamo</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full pl-8 rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 font-bold"
                                        value={data.monto}
                                        onChange={e => setData('monto', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.monto && <p className="mt-1 text-sm text-red-600">{errors.monto}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tase de Interés (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2"
                                    value={data.interes}
                                    onChange={e => setData('interes', e.target.value)}
                                    required
                                />
                                {errors.interes && <p className="mt-1 text-sm text-red-600">{errors.interes}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia de Pago</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2"
                                    value={data.tipo_pago}
                                    onChange={e => setData('tipo_pago', e.target.value)}
                                    required
                                >
                                    <option value="diario">Diario</option>
                                    <option value="semanal">Semanal</option>
                                    <option value="mensual">Mensual</option>
                                    <option value="trimestral">Trimestral</option>
                                    <option value="semestral">Semestral</option>
                                    <option value="anual">Anual</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de Cuotas</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2"
                                    value={data.numero_cuotas}
                                    onChange={e => setData('numero_cuotas', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Inicio</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2"
                                    value={data.fecha_inicio}
                                    onChange={e => setData('fecha_inicio', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2"
                                    value={data.moneda_id}
                                    onChange={e => setData('moneda_id', e.target.value)}
                                    required
                                >
                                    {currencies.map(curr => (
                                        <option key={curr.id} value={curr.id}>{curr.nombre} ({curr.simbolo})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Calculation Preview */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-full">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">Proyección de Cuota</p>
                                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">
                                    ${calculatedQuota.toFixed(2)} <span className="text-sm font-normal">/ {data.tipo_pago}</span>
                                </p>
                            </div>
                        </div>

                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Inversionista (Socio)</h3>
                                {data.investors.length === 0 && (
                                    <button
                                        type="button"
                                        onClick={addInvestor}
                                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        <Plus className="w-4 h-4" /> Agregar Socio
                                    </button>
                                )}
                            </div>

                            {/* Validation Error for Array using explicit type check or simple access if typed */}
                            {/* useForm errors for array fields usually require more complex path handling or simple string access if flattened */}
                            {errors.investors && <p className="text-sm text-red-600 mb-2">{errors.investors}</p>}

                            <div className="space-y-3">
                                {data.investors.map((investor, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-lg">
                                        <div className="flex-1 w-full">
                                            <label className="text-xs text-gray-500 mb-1 block">Socio</label>
                                            <select
                                                className="w-full rounded-md border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm py-1.5"
                                                value={investor.socio_id}
                                                onChange={e => updateInvestor(index, 'socio_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar...</option>
                                                {partners.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.nombre} (Disp: ${parseFloat(p.capital_disponible).toFixed(2)})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-full md:w-48">
                                            <label className="text-xs text-gray-500 mb-1 block">Inversión (Informativo)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1.5 text-gray-400 font-bold">$</span>
                                                <input
                                                    type="text"
                                                    className="w-full pl-7 rounded-md border-gray-300 bg-gray-50 dark:bg-zinc-800/50 text-gray-500 font-bold text-sm py-1.5"
                                                    value={parseFloat(data.monto || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeInvestor(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-md mb-0.5"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {(() => {
                                    const loanAmount = parseFloat(data.monto) || 0;
                                    const totalInterest = loanAmount * (parseFloat(data.interes.toString()) / 100);
                                    const partnersCapital = data.investors.reduce((s, i) => s + Number(i.monto), 0);
                                    const companyCapital = loanAmount - partnersCapital;

                                    let partnersProfit = 0;
                                    let companyProfit = 0;

                                    // Calc profits from partners shares
                                    data.investors.forEach(inv => {
                                        const socio = partners.find(p => p.id == inv.socio_id);
                                        if (socio && loanAmount > 0) {
                                            const shareProfit = totalInterest * (Number(inv.monto) / loanAmount);
                                            partnersProfit += shareProfit * (parseFloat(socio.porcentaje_ganancia_socio) / 100);
                                            companyProfit += shareProfit * (parseFloat(socio.porcentaje_ganancia_dueno) / 100);
                                        }
                                    });

                                    // Calc profits from company share
                                    if (loanAmount > 0) {
                                        companyProfit += (companyCapital / loanAmount) * totalInterest;
                                    }

                                    return (
                                        <div className="space-y-4 mt-4">
                                            {data.investors.length === 0 && (
                                                <div className="text-sm text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/20 font-semibold flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                                                    <div>
                                                        <p className="text-base">Financiamiento Propio</p>
                                                        <p className="font-normal opacity-80 text-xs">Este préstamo será cubierto al 100% por el capital de la empresa.</p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Capital Breakdown */}
                                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-700">
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider">Desglose de Capital</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Total Socios:</span>
                                                            <span className="font-bold text-emerald-600">${partnersCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-zinc-700">
                                                            <span className="text-gray-600 dark:text-gray-400">Total Empresa:</span>
                                                            <span className="font-bold text-indigo-600">${companyCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Profit Breakdown */}
                                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-700">
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider">Ganancia Proyectada</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Para Socios:</span>
                                                            <span className="font-bold text-emerald-600">${partnersProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-zinc-700">
                                                            <span className="text-gray-600 dark:text-gray-400">Para Empresa (Dueño):</span>
                                                            <span className="font-bold text-indigo-600">${companyProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link
                                href={route('loans.index')}
                                className="px-4 py-2 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                            >
                                Crear Préstamo
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
