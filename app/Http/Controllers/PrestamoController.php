<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Cliente;
use App\Models\Socio;
use App\Models\Moneda;
use App\Services\PrestamoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrestamoController extends Controller
{
    protected $prestamoService;

    public function __construct(PrestamoService $prestamoService)
    {
        $this->prestamoService = $prestamoService;
    }

    public function index()
    {
        $loans = Prestamo::with('cliente', 'moneda')->latest()->paginate(15)->withQueryString();
        return Inertia::render('Loans/Index', [
            'loans' => $loans
        ]);
    }

    public function create()
    {
        return Inertia::render('Loans/Create', [
            'clients' => Cliente::where('estado_crediticio', '!=', 'incobrable')->get(),
            'partners' => Socio::where('estado', 'activo')->where('capital_disponible', '>', 0)->get(),
            'currencies' => Moneda::where('estado', 'activo')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'moneda_id' => 'required|exists:monedas,id',
            'monto' => 'required|numeric|min:1',
            'interes' => 'required|numeric|min:0',
            'tipo_pago' => 'required|in:diario,semanal,mensual,trimestral,semestral,anual',
            'numero_cuotas' => 'required|integer|min:1',
            'fecha_inicio' => 'required|date',
            'investors' => 'nullable|array',
            'investors.*.socio_id' => 'required_with:investors|exists:socios,id',
            'investors.*.monto' => 'required_with:investors|numeric|min:0.01',
        ]);

        try {
            $this->prestamoService->createLoan($request->except('investors'), $request->input('investors', []));
            return redirect()->route('loans.index')->with('success', 'Préstamo creado exitosamente.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(Prestamo $loan)
    {
        $loan->load(['cliente', 'socios', 'cuotas.pagos', 'moneda']);
        
        $company = \App\Models\Empresa::first();
        if ($company && $company->qr_pago) {
            $company->qr_pago_url = \Illuminate\Support\Facades\Storage::url($company->qr_pago);
        }

        return Inertia::render('Loans/Show', [
            'loan' => $loan,
            'company' => $company
        ]);
    }

    public function edit(Prestamo $loan)
    {
        return redirect()->back()->with('error', 'La edición directa de préstamos activos está restringida para proteger la integridad financiera.');
    }
}
