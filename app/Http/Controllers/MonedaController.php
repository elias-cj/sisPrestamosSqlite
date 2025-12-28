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

    public function edit(Moneda $currency)
    {
        return Inertia::render('Currencies/Edit', [
            'currency' => $currency
        ]);
    }

    public function update(Request $request, Moneda $currency)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'simbolo' => 'required|string|max:10',
            'codigo' => 'required|string|max:10|unique:monedas,codigo,' . $currency->id,
            'tipo_cambio' => 'required|numeric|min:0',
            'estado' => 'required|in:activo,inactivo',
        ]);

        $currency->update($validated);

        return redirect()->route('currencies.index')->with('success', 'Moneda actualizada correctamente.');
    }

    public function destroy(Moneda $currency)
    {
        // Check for usage in loans before deletion
        if ($currency->prestamos()->exists()) {
            return back()->with('error', 'No se puede eliminar una moneda que tiene préstamos asociados. Desactívela en su lugar.');
        }

        $currency->delete();

        return redirect()->route('currencies.index')->with('success', 'Moneda eliminada correctamente.');
    }
}
