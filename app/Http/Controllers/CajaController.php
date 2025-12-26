<?php

namespace App\Http\Controllers;

use App\Models\Caja;
use App\Services\CajaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CajaController extends Controller
{
    protected $cajaService;

    public function __construct(CajaService $cajaService)
    {
        $this->cajaService = $cajaService;
    }

    public function index()
    {
        $dailyBox = Caja::where('usuario_id', Auth::id())->latest()->first();
        // Pagination for history
        $history = Caja::where('usuario_id', Auth::id())->latest()->paginate(10)->withQueryString();
        
        return Inertia::render('Cash/Index', [
            'dailyBox' => $dailyBox,
            'history' => $history,
            'isOpen' => $dailyBox && $dailyBox->estado === 'abierta',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'monto_apertura' => 'required|numeric|min:0',
        ]);

        try {
            $this->cajaService->openBox($request->monto_apertura);
            return redirect()->back()->with('success', 'Caja abierta correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function update(Request $request, Caja $cash)
    {
        if ($cash->usuario_id !== Auth::id()) {
            return back()->with('error', 'No puedes cerrar una caja ajena.');
        }

        try {
            $cash->update([
                'monto_cierre' => $cash->monto_apertura + $cash->total_ingresos - $cash->total_egresos,
                'estado' => 'cerrada'
            ]);
            
            return redirect()->back()->with('success', 'Caja cerrada correctamente.');
        } catch (\Exception $e) {
             return redirect()->back()->with('error', 'Error al cerrar caja: ' . $e->getMessage());
        }
    }
}
