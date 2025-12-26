<?php

namespace App\Services;

use App\Models\Caja;
use Illuminate\Support\Facades\Auth;

class CashService
{
    public function openBox($amount)
    {
        if ($this->hasOpenBox()) {
            throw new \Exception("Ya tienes una caja abierta.");
        }
        
        return Caja::create([
            'usuario_id' => Auth::id(),
            'fecha' => now(),
            'monto_apertura' => $amount,
            'estado' => 'abierta',
        ]);
    }
    
    public function closeBox(Caja $caja, $actualCash)
    {
        $caja->update([
            'monto_cierre' => $actualCash,
            'estado' => 'cerrada',
        ]);
        return $caja;
    }
    
    public function hasOpenBox()
    {
        return Caja::where('usuario_id', Auth::id())
                   ->where('estado', 'abierta')
                   ->exists();
    }
    
    public function getCurrentBox()
    {
         return Caja::where('usuario_id', Auth::id())
                   ->where('estado', 'abierta')
                   ->first();
    }
}
