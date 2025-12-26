<?php

namespace App\Http\Controllers;

use App\Models\Socio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SocioController extends Controller
{
    public function index()
    {
        $partners = Socio::latest()->paginate(15)->withQueryString();
        return Inertia::render('Partners/Index', [
            'partners' => $partners
        ]);
    }

    public function create()
    {
        return Inertia::render('Partners/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'documento' => 'required|string|unique:socios,documento',
            'telefono' => 'nullable|string',
            'capital_inicial' => 'required|numeric|min:0',
            'porcentaje_ganancia_socio' => 'required|numeric|min:0|max:100',
            'porcentaje_ganancia_dueno' => 'required|numeric|min:0|max:100',
        ]);

        if (($validated['porcentaje_ganancia_socio'] + $validated['porcentaje_ganancia_dueno']) != 100) {
            return back()->withErrors(['porcentaje_ganancia_socio' => 'La suma de porcentajes debe ser 100%']);
        }

        $validated['capital_disponible'] = $validated['capital_inicial'];
        $validated['capital_comprometido'] = 0;
        $validated['ganancias_acumuladas'] = 0;
        
        Socio::create($validated);

        return redirect()->route('partners.index')->with('success', 'Socio registrado correctamente.');
    }

    public function show(Socio $partner)
    {
        return Inertia::render('Partners/Show', [
            'partner' => $partner->load(['prestamos', 'ganancias.prestamo'])
        ]);
    }

    public function edit(Socio $partner)
    {
        return Inertia::render('Partners/Edit', [
            'partner' => $partner
        ]);
    }

    public function update(Request $request, Socio $partner)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'documento' => 'required|string|unique:socios,documento,' . $partner->id,
            'telefono' => 'nullable|string',
            'capital_inicial' => 'required|numeric|min:0',
            'porcentaje_ganancia_socio' => 'required|numeric|min:0|max:100',
            'porcentaje_ganancia_dueno' => 'required|numeric|min:0|max:100',
            'estado' => 'required|in:activo,inactivo',
        ]);
        
        if (($validated['porcentaje_ganancia_socio'] + $validated['porcentaje_ganancia_dueno']) != 100) {
            return back()->withErrors(['porcentaje_ganancia_socio' => 'La suma de porcentajes debe ser 100%']);
        }

        $diff = $validated['capital_inicial'] - $partner->capital_inicial;
        $partner->capital_disponible += $diff;
        
        $partner->update(array_merge($validated, ['capital_disponible' => $partner->capital_disponible]));

        return redirect()->route('partners.index')->with('success', 'Socio actualizado correctamente.');
    }

    public function destroy(Socio $partner)
    {
        if ($partner->capital_comprometido > 0) {
            return back()->with('error', 'No se puede eliminar socio con capital comprometido.');
        }
        
        return back()->with('error', 'Por seguridad, solo puede desactivar al socio. No se permite la eliminación física.');
    }
}
