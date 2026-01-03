<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoriaGastoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Settings/ExpenseCategories/Index', [
            'categories' => \App\Models\CategoriaGasto::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:categorias_gastos,nombre',
            'descripcion' => 'nullable|string|max:500',
        ]);

        \App\Models\CategoriaGasto::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'estado' => 'activo',
        ]);

        return back()->with('success', 'Categoría de gasto creada correctamente.');
    }

    public function update(Request $request, \App\Models\CategoriaGasto $expenseCategory)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:categorias_gastos,nombre,' . $expenseCategory->id,
            'descripcion' => 'nullable|string|max:500',
            'estado' => 'required|in:activo,inactivo',
        ]);

        $expenseCategory->update($request->all());

        return back()->with('success', 'Categoría de gasto actualizada correctamente.');
    }

    public function destroy(\App\Models\CategoriaGasto $expenseCategory)
    {
        if ($expenseCategory->gastos()->exists()) {
            return back()->with('error', 'No se puede eliminar la categoría porque tiene gastos asociados.');
        }

        $expenseCategory->delete();

        return back()->with('success', 'Categoría de gasto eliminada correctamente.');
    }
}
