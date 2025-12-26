<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Cliente;
use Illuminate\Support\Facades\DB;

class RankingController extends Controller
{
    public function index()
    {
        // 1. Buenos Pagadores: Clientes con préstamos pagados y 0 mora histórica (sum of moras in pagos)
        $goodPayers = Cliente::whereHas('prestamos', function($q) {
                $q->where('estado', 'pagado');
            })
            ->withCount(['prestamos as prestamos_pagados' => function($q) {
                $q->where('estado', 'pagado');
            }])
            ->with(['prestamos.pagos']) // Eager load para evitar N+1
            ->get()
            ->filter(function($client) {
                // Check if they ever paid late fees
                $totalMora = $client->prestamos->flatMap->pagos->sum('mora');
                return $totalMora == 0;
            })
            ->sortByDesc('prestamos_pagados')
            ->take(10)
            ->values();

        // 2. Malos Pagadores: Clientes con mora acumulada o vencidos
        $badPayers = Cliente::whereHas('prestamos', function($q) {
                $q->whereIn('estado', ['vencido', 'activo']);
            })
            ->with(['prestamos.pagos']) // Eager load
            ->get()
            ->map(function($client) {
                $totalMora = 0;
                $activeLoans = 0;
                foreach($client->prestamos as $loan) {
                    if(in_array($loan->estado, ['activo', 'vencido'])) {
                        $activeLoans++;
                        // Calculate debt/mora roughly or from payments
                         $totalMora += $loan->pagos->sum('mora');
                    }
                }
                $client->total_mora = $totalMora;
                $client->active_loans = $activeLoans;
                return $client;
            })
            ->filter(function($client) {
                return $client->total_mora > 0;
            })
            ->sortByDesc('total_mora')
            ->take(10)
            ->values();

        return Inertia::render('Ranking/Index', [
            'goodPayers' => $goodPayers,
            'badPayers' => $badPayers
        ]);
    }
}
