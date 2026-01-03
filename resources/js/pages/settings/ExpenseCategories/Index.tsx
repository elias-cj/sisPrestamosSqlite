import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Folder, Edit2, Save, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configuración', href: '/settings' },
    { title: 'Categorías de Gastos', href: '/expense-categories' },
];

export default function Index({ categories }: { categories: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre: '',
        descripcion: '',
        estado: 'activo',
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (category: any) => {
        setEditingCategory(category);
        setData({
            nombre: category.nombre,
            descripcion: category.descripcion || '',
            estado: category.estado,
        });
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/expense-categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        } else {
            post('/expense-categories', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const deleteCategory = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta categoría? Solo se podrá eliminar si no tiene gastos asociados.')) {
            router.delete(`/expense-categories/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías de Gastos" />
            <div className="p-6 max-w-5xl mx-auto">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <Folder className="w-8 h-8 text-indigo-500" />
                            Categorías de Gastos
                        </h1>
                        <p className="text-gray-500 dark:text-zinc-400 mt-1">Administra las etiquetas para organizar tus gastos operativos.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" /> Nueva Categoría
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
                            <Folder className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No hay categorías registradas.</p>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div key={category.id} className="group bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-700 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-300 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 ${category.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${category.estado === 'activo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'bg-gray-100 text-gray-400 dark:bg-zinc-700'}`}>
                                        <Folder className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(category)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deleteCategory(category.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{category.nombre}</h3>
                                <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 mb-4">{category.descripcion || 'Sin descripción'}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${category.estado === 'activo' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {category.estado}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal Premium */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                        {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                                    </h3>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>

                                <form onSubmit={submit} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-tighter text-gray-400 mb-2">Nombre de la Categoría</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-2xl border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 px-6 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                            placeholder="Ej: Transporte, Alquiler, etc."
                                            value={data.nombre}
                                            onChange={e => setData('nombre', e.target.value)}
                                            required
                                        />
                                        {errors.nombre && <p className="text-red-500 text-xs mt-2 px-2">{errors.nombre}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-tighter text-gray-400 mb-2">Descripción (Opcional)</label>
                                        <textarea
                                            className="w-full rounded-2xl border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 px-6 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all min-h-[120px]"
                                            placeholder="¿A qué se refiere esta categoría?"
                                            value={data.descripcion}
                                            onChange={e => setData('descripcion', e.target.value)}
                                        />
                                        {errors.descripcion && <p className="text-red-500 text-xs mt-2 px-2">{errors.descripcion}</p>}
                                    </div>

                                    {editingCategory && (
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-tighter text-gray-400 mb-2">Estado</label>
                                            <div className="flex gap-4">
                                                {['activo', 'inactivo'].map((status) => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => setData('estado', status)}
                                                        className={`flex-1 py-3 rounded-xl font-bold capitalize transition-all ${data.estado === status
                                                                ? status === 'activo' ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-red-100 text-red-700 ring-2 ring-red-500'
                                                                : 'bg-gray-100 text-gray-400 dark:bg-zinc-800'
                                                            }`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                                        >
                                            {processing ? 'Guardando...' : <><Save className="w-5 h-5" /> {editingCategory ? 'Actualizar' : 'Crear Categoría'}</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
