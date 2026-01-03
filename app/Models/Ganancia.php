<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ganancia extends Model
{
    use HasFactory;

    protected $fillable = [
        'prestamo_id',
        'socio_id',
        'pago_id',
        'monto_ganancia_socio',
        'monto_ganancia_dueno',
    ];
    
    protected $casts = [
        'monto_ganancia_socio' => 'decimal:2',
        'monto_ganancia_dueno' => 'decimal:2',
    ];

    public function prestamo() { return $this->belongsTo(Prestamo::class); }
    public function socio() { return $this->belongsTo(Socio::class); }
}
