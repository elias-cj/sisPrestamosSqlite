<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class PrestamoSocio extends Pivot
{
    protected $table = 'prestamo_socio';
    
    public $incrementing = true; // Since we added id() in migration
    public $timestamps = true;

    protected $fillable = [
        'prestamo_id',
        'socio_id',
        'monto_aportado',
        'porcentaje_participacion',
        'porcentaje_ganancia_socio',
        'porcentaje_ganancia_dueno',
    ];
    
    protected $casts = [
        'monto_aportado' => 'decimal:2',
        'porcentaje_participacion' => 'decimal:2',
        'porcentaje_ganancia_socio' => 'decimal:2',
        'porcentaje_ganancia_dueno' => 'decimal:2',
    ];
}
