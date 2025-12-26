<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class Pago extends Model
{
    use HasFactory, LogsActivity;

    public $timestamps = false;

    protected $fillable = [
        'cuota_id',
        'monto_pagado',
        'fecha_pago',
        'mora',
        'usuario_id',
        'caja_id',
    ];

    protected $casts = [
        'fecha_pago' => 'date',
        'monto_pagado' => 'decimal:2',
        'mora' => 'decimal:2',
    ];

    public function cuota() { return $this->belongsTo(Cuota::class); }
    public function usuario() { return $this->belongsTo(Usuario::class, 'usuario_id'); }
    public function caja() { return $this->belongsTo(Caja::class); }
}
