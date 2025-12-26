<?php

namespace App\Http\Controllers;

use App\Models\Moneda;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonedaController extends Controller
{
    public function index()
    {
        $currencies = Moneda::latest()->paginate(15)->withQueryString();
        return Inertia::render('Currencies/Index', [
            'currencies' => $currencies
        ]);
    }

    public function create()
    {
        return Inertia::render('Currencies/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'simbolo' => 'required|string|max:10',
            'codigo' => 'required|string|max:10|unique:monedas,codigo',
            'tipo_cambio' => 'required|numeric|min:0',
        ]);

        Moneda::create($validated);

        return redirect()->route('currencies.index')->with('success', 'Moneda creada correctamente.');
    }

    public function edit(Moneda $moneda)
    {
        return Inertia::render('Currencies/Edit', [
            'currency' => $moneda
        ]);
    }

    public function update(Request $request, Moneda $moneda)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'simbolo' => 'required|string|max:10',
            'codigo' => 'required|string|max:10|unique:monedas,codigo,' . $moneda->id,
            'tipo_cambio' => 'required|numeric|min:0',
            'estado' => 'required|in:activo,inactivo',
        ]);

        $moneda->update($validated);

        return redirect()->route('currencies.index')->with('success', 'Moneda actualizada correctamente.');
    }

    public function destroy(Moneda $moneda)
    {
        // Check for usage in loans before deletion
        if ($moneda->prestamos()->exists()) {
            return back()->with('error', 'No se puede eliminar una moneda que tiene préstamos asociados. Desactívela en su lugar.');
        }

        $moneda->delete();

        return redirect()->route('currencies.index')->with('success', 'Moneda eliminada correctamente.');
    }
}
