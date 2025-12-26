<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Socio;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

$startDate = Carbon::now()->startOfMonth()->toDateString();
$endDate = Carbon::now()->endOfMonth()->toDateString();
$start = Carbon::parse($startDate)->startOfDay();
$end = Carbon::parse($endDate)->endOfDay();

echo "Periodo: $startDate al $endDate\n\n";

$partnersProfit = Socio::all()->map(function($socio) use ($start, $end) {
    $gains = $socio->ganancias()
        ->whereBetween('created_at', [$start, $end])
        ->selectRaw('SUM(monto_ganancia_socio) as ganancia_socio, SUM(monto_ganancia_dueno) as mi_ganancia')
        ->first();

    $gananciaSocio = (float) ($gains->ganancia_socio ?? 0);
    $miGanancia = (float) ($gains->mi_ganancia ?? 0);

    return [
        'id' => $socio->id,
        'nombre' => $socio->nombre,
        'ganancia_socio' => $gananciaSocio,
        'mi_ganancia' => $miGanancia,
    ];
});

print_r($partnersProfit->toArray());

$totalMiGanancia = (float) \App\Models\Ganancia::whereBetween('created_at', [$start, $end])->sum('monto_ganancia_dueno');
echo "\nTotal Comisión Empresa (Consolidado): $totalMiGanancia\n";
