import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Building2, Palette, Save, Moon, Sun, Monitor, Upload, Lock, Database, Download, History } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Transition } from '@headlessui/react';
import { router } from '@inertiajs/react';
import { useAppearance } from '@/hooks/use-appearance';

function DatabaseSettings() {
    const { data: restoreData, setData: setRestoreData, post: postRestore, processing: restoreProcessing, errors: restoreErrors } = useForm({
        backup_file: null as File | null,
    });

    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, errors: importErrors } = useForm({
        import_file: null as File | null,
    });

    const handleRestore = (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('¿Estás seguro de que deseas restaurar la base de datos? Esto sobrescribirá todos los datos actuales.')) return;

        postRestore(`${window.location.origin}/settings/database/restore`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => alert('Base de datos restaurada correctamente.'),
        });
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        postImport(`${window.location.origin}/settings/database/import`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => alert('Datos importados correctamente.'),
        });
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Copia de Seguridad</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Descarga una copia completa de tu base de datos.</p>
                </div>
                <div>
                    <a
                        href={`${window.location.origin}/settings/database/backup`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        download
                    >
                        <Download className="w-4 h-4" />
                        Descargar Backup (.sqlite)
                    </a>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Restaurar Base de Datos</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sube un archivo .sqlite para restaurar el sistema. <span className="text-red-500 font-bold">¡Cuidado! Esto borrará los datos actuales.</span></p>
                </div>
                <form onSubmit={handleRestore} className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900">
                        <input
                            type="file"
                            accept=".sqlite,.db"
                            onChange={e => setRestoreData('backup_file', e.target.files ? e.target.files[0] : null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-zinc-800 dark:file:text-indigo-400"
                        />
                    </div>
                    {restoreErrors.backup_file && <p className="text-red-500 text-xs">{restoreErrors.backup_file}</p>}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={restoreProcessing || !restoreData.backup_file}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            <Database className="w-4 h-4" />
                            Restaurar Base de Datos
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Importar Clientes (Excel)</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Importa masivamente Clientes desde un archivo Excel/CSV.</p>
                </div>

                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-2 font-medium">¿No sabes cómo estructurar tu archivo?</p>
                    <button
                        onClick={() => {
                            // Descargar usando fetch para forzar descarga binaria
                            fetch(`${window.location.origin}/settings/database/template`)
                                .then(response => response.blob())
                                .then(blob => {
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'plantilla_clientes.xlsx';
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                })
                                .catch(err => alert('Error al descargar la plantilla: ' + err));
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Descargar Plantilla Excel (.xlsx)
                    </button>
                </div>

                <form onSubmit={handleImport} className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900">
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={e => setImportData('import_file', e.target.files ? e.target.files[0] : null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-zinc-800 dark:file:text-emerald-400"
                        />
                    </div>
                    {importErrors.import_file && <p className="text-red-500 text-xs">{importErrors.import_file}</p>}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={importProcessing || !importData.import_file}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Importar Clientes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function SettingsIndex({ company }: any) {
    const { appearance, updateAppearance } = useAppearance();
    const [activeTab, setActiveTab] = useState(localStorage.getItem('settings_active_tab') || 'company');
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    // Persistir pestaña activa
    useEffect(() => {
        localStorage.setItem('settings_active_tab', activeTab);
    }, [activeTab]);

    interface CompanyForm {
        nombre: string;
        razon_social: string;
        direccion: string;
        telefono: string;
        email: string;
        logo: File | null;
        _method: string;
    }

    // Company Form
    const { data, setData, post, processing, errors: companyErrors, recentlySuccessful } = useForm<CompanyForm>({
        nombre: company?.nombre || '',
        razon_social: company?.razon_social || '',
        direccion: company?.direccion || '',
        telefono: company?.telefono || '',
        email: company?.email || '',
        logo: null as File | null,
        _method: 'PATCH',
    });

    // Password Form
    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
        recentlySuccessful: passwordRecentlySuccessful
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitCompany = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('company.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        putPassword(route('user-password.update'), {
            errorBag: 'updatePassword',
            preserveScroll: true,
            onSuccess: () => resetPassword(),
            onError: (errors) => {
                if (errors.password) {
                    resetPassword('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    resetPassword('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const breadcrumbs = [
        { title: 'Configuración', href: '/settings' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración" />

            <div className="flex h-full flex-col gap-6 p-6 max-w-5xl mx-auto w-full">

                <div className="flex flex-col md:flex-row gap-6">
                    {/* --- Sidebar Tabs --- */}
                    <div className="w-full md:w-64 shrink-0 space-y-2">
                        <button
                            onClick={() => setActiveTab('company')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'company'
                                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
                        >
                            <Building2 className="w-5 h-5" />
                            Datos de la Empresa
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'security'
                                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
                        >
                            <Lock className="w-5 h-5" />
                            Seguridad
                        </button>
                        <button
                            onClick={() => setActiveTab('appearance')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'appearance'
                                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
                        >
                            <Palette className="w-5 h-5" />
                            Apariencia
                        </button>
                        <button
                            onClick={() => setActiveTab('database')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'database'
                                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
                        >
                            <Database className="w-5 h-5" />
                            Base de Datos
                        </button>

                        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <Link
                                href="/reports/activity-logs"
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50"
                            >
                                <History className="w-5 h-5 text-purple-500" />
                                Auditoría de Actividad
                            </Link>
                        </div>
                    </div>

                    {/* --- Content Area --- */}
                    <div className="flex-1">

                        {/* COMPANY TAB */}
                        {activeTab === 'company' && (
                            // ... existing company tab content ...
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Datos de la Empresa</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza el nombre, logo y contacto del sistema.</p>
                                </div>
                                <form onSubmit={submitCompany} className="space-y-5">
                                    {/* ... form content ... */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Sistema</label>
                                            <input
                                                type="text"
                                                value={data.nombre}
                                                onChange={e => setData('nombre', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {companyErrors.nombre && <p className="text-red-500 text-xs">{companyErrors.nombre}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Razón Social</label>
                                            <input
                                                type="text"
                                                value={data.razon_social}
                                                onChange={e => setData('razon_social', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {companyErrors.razon_social && <p className="text-red-500 text-xs">{companyErrors.razon_social}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                                            <input
                                                type="text"
                                                value={data.telefono}
                                                onChange={e => setData('telefono', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {companyErrors.telefono && <p className="text-red-500 text-xs">{companyErrors.telefono}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {companyErrors.email && <p className="text-red-500 text-xs">{companyErrors.email}</p>}
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo del Sistema</label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-zinc-700 border-dashed rounded-lg bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer relative">
                                                <div className="space-y-1 text-center">
                                                    {data.logo ? (
                                                        <span className="text-indigo-600 font-medium">Archivo seleccionado: {data.logo.name}</span>
                                                    ) : (
                                                        <>
                                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="relative cursor-pointer bg-white dark:bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                                    <span>Subir imagen</span>
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={e => setData('logo', e.target.files ? e.target.files[0] : null)}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] text-gray-500 italic">Formatos recomendados: PNG, JPG, SVG o WebP (PDF aceptado).</p>
                                                {company?.logo && (
                                                    <div className="text-xs text-gray-500">
                                                        Logo actual cargado
                                                    </div>
                                                )}
                                            </div>
                                            {companyErrors.logo && <p className="text-red-500 text-xs mt-1">{companyErrors.logo}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-end gap-3">
                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Guardado.</p>
                                        </Transition>
                                        <button
                                            disabled={processing}
                                            type="submit"
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" /> Guardar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* SECURITY TAB (PASSWORD) */}
                        {activeTab === 'security' && (
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seguridad</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Actualiza tu contraseña para mantener la cuenta segura.</p>
                                </div>
                                <form onSubmit={submitPassword} className="space-y-5 max-w-lg">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña Actual</label>
                                        <input
                                            ref={currentPasswordInput}
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={e => setPasswordData('current_password', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                            autoComplete="current-password"
                                        />
                                        {passwordErrors.current_password && <p className="text-red-500 text-xs">{passwordErrors.current_password}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nueva Contraseña</label>
                                        <input
                                            ref={passwordInput}
                                            type="password"
                                            value={passwordData.password}
                                            onChange={e => setPasswordData('password', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                            autoComplete="new-password"
                                        />
                                        {passwordErrors.password && <p className="text-red-500 text-xs">{passwordErrors.password}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwordData.password_confirmation}
                                            onChange={e => setPasswordData('password_confirmation', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <div className="pt-4 flex items-center justify-end gap-3">
                                        <Transition
                                            show={passwordRecentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-emerald-600 font-medium">Contraseña actualizada.</p>
                                        </Transition>
                                        <button
                                            disabled={passwordProcessing}
                                            type="submit"
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" /> Actualizar Contraseña
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* APPEARANCE TAB */}
                        {/* APPEARANCE TAB */}
                        {activeTab === 'appearance' && (
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apariencia</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Modo oscuro para trabajar cómodamente de noche.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => updateAppearance('light')}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${appearance === 'light' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'}`}
                                    >
                                        <div className="p-3 bg-white rounded-full shadow-sm">
                                            <Sun className={`w-6 h-6 ${appearance === 'light' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        </div>
                                        <span className={`font-medium ${appearance === 'light' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>Claro</span>
                                    </button>

                                    <button
                                        onClick={() => updateAppearance('dark')}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${appearance === 'dark' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'}`}
                                    >
                                        <div className="p-3 bg-zinc-900 rounded-full shadow-sm">
                                            <Moon className={`w-6 h-6 ${appearance === 'dark' ? 'text-indigo-400' : 'text-gray-400'}`} />
                                        </div>
                                        <span className={`font-medium ${appearance === 'dark' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>Oscuro</span>
                                    </button>

                                    <button
                                        onClick={() => updateAppearance('system')}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${appearance === 'system' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'}`}
                                    >
                                        <div className="p-3 bg-gray-100 dark:bg-zinc-700 rounded-full shadow-sm">
                                            <Monitor className={`w-6 h-6 ${appearance === 'system' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        </div>
                                        <span className={`font-medium ${appearance === 'system' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>Sistema</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* DATABASE TAB */}
                        {activeTab === 'database' && (
                            <DatabaseSettings />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
