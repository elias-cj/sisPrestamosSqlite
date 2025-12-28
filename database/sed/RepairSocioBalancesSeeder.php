<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Socio;
use App\Models\Prestamo;
use Illuminate\Support\Facades\DB;

class RepairSocioBalancesSeeder extends Seeder
{
    public function run()
    {
        $socios = Socio::all();

        foreach ($socios as $socio) {
            echo "--- Reparando socio: {$socio->nombre} (ID: {$socio->id}) ---\n";

            // 1. Ganancias Reales (Lo que ya se ha ganado históricamente)
            $totalGanado = $socio->ganancias()->sum('monto_ganancia_socio');

            // 2. Capital Comprometido (En Calle) Real
            // Buscamos todos los préstamos vinculados al socio que NO estén cancelados
            $totalComprometido = 0;
            
            $prestamosSocios = DB::table('prestamo_socio')
                ->join('prestamos', 'prestamos.id', '=', 'prestamo_socio.prestamo_id')
                ->where('prestamo_socio.socio_id', $socio->id)
                ->whereIn('prestamos.estado', ['activo', 'parcial', 'vencido', 'registrado']) // Estados NO finalizados
                ->get();

            foreach ($prestamosSocios as $ps) {
                $loan = Prestamo::find($ps->prestamo_id);
                
                // Capital pendiente en este préstamo
                $totalCuotas = $loan->numero_cuotas;
                $cuotasPendientes = $loan->cuotas()->where('estado', '!=', 'pagado')->count();
                
                // Capital proporcional aportado por este socio que sigue "en calle"
                $capitalEnCalleSocio = ($ps->monto_aportado / $totalCuotas) * $cuotasPendientes;
                
                echo "   >> Préstamo ID {$ps->prestamo_id}: Aportó {$ps->monto_aportado}, Cuotas {$cuotasPendientes}/{$totalCuotas}, En Calle: {$capitalEnCalleSocio}\n";
                
                $totalComprometido += $capitalEnCalleSocio;
            }

            // 3. Aplicar fórmula del usuario: Disponible = Inicial - Comprometido
            $nuevoDisponible = $socio->capital_inicial - $totalComprometido;

            // 4. Actualizar Socio
            $socio->update([
                'capital_disponible' => $nuevoDisponible,
                'capital_comprometido' => $totalComprometido,
                'ganancias_acumuladas' => $totalGanado
            ]);

            echo "   => INICIAL: {$socio->capital_inicial}\n";
            echo "   => NUEVO DISPONIBLE: {$nuevoDisponible}\n";
            echo "   => NUEVO COMPROMETIDO: {$totalComprometido}\n";
            echo "   => GANANCIAS: {$totalGanado}\n\n";
        }
    }
}
