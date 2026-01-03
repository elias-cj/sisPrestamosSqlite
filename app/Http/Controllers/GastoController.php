<?php

namespace App\Http\Controllers;

use App\Models\Gasto;
use App\Models\Caja;
use App\Models\CategoriaGasto;
use App\Models\Moneda;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GastoController extends Controller
{
    public function index(Request $request)
    {
        $query = Gasto::with(['categoria', 'usuario', 'moneda']);

        if ($request->from_date) $query->whereDate('fecha', '>=', $request->from_date);
        if ($request->to_date) $query->whereDate('fecha', '<=', $request->to_date);
        
        // Asumiendo que 'created_at' tiene la hora exacta si 'fecha' es solo date
        if ($request->from_time) $query->whereTime('created_at', '>=', $request->from_time);
        if ($request->to_time) $query->whereTime('created_at', '<=', $request->to_time);

        $gastos = $query->latest()->paginate(10)->withQueryString();
        $categorias = CategoriaGasto::all();

        return Inertia::render('Expenses/Index', [
            'expenses' => $gastos,
            'categories' => $categorias,
            'filters' => $request->only(['from_date', 'to_date', 'from_time', 'to_time']),
            'currencies' => Moneda::where('estado', 'activo')->get(),
            'isBoxOpen' => Caja::where('usuario_id', Auth::id())->where('estado', 'abierta')->exists(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'categoria_gasto_id' => 'required|exists:categorias_gastos,id',
            'descripcion' => 'required|string|max:255',
            'monto' => 'required|numeric|min:0.01',
            'moneda_id' => 'required|exists:monedas,id',
        ]);

        $caja = Caja::where('usuario_id', Auth::id())->where('estado', 'abierta')->first();

        if (!$caja) {
            return back()->with('error', 'Debes tener una caja abierta para registrar gastos.');
        }

        try {
            DB::transaction(function () use ($request, $caja) {
                Gasto::create([
                    'categoria_gasto_id' => $request->categoria_gasto_id,
                    'descripcion' => $request->descripcion,
                    'monto' => $request->monto,
                    'moneda_id' => $request->moneda_id,
                    'fecha' => now(),
                    'usuario_id' => Auth::id(),
                    'caja_id' => $caja->id,
                    'estado' => 'registrado',
                ]);

                $caja->increment('total_egresos', $request->monto);
            });

            return redirect()->route('expenses.index')->with('success', 'Gasto registrado correctamente.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al registrar el gasto: ' . $e->getMessage());
        }
    }

    public function destroy(Gasto $expense)
    {
        if ($expense->estado === 'anulado') {
            return back()->with('error', 'El gasto ya está anulado.');
        }
        
        $caja = Caja::find($expense->caja_id);
        
        if (!$caja || $caja->estado !== 'abierta') {
             return back()->with('error', 'Solo se pueden anular gastos de la caja actual abierta.');
        }
        
        DB::transaction(function () use ($expense, $caja) {
            $expense->update(['estado' => 'anulado']);
            $caja->decrement('total_egresos', $expense->monto);
        });

        return back()->with('success', 'Gasto anulado correctamente.');
    }
}
