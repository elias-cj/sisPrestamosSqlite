<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Factories\HasFactory; // Added for HasFactory
use App\Traits\LogsActivity;

class PrestamoSocio extends Pivot // Reverted to Pivot as per original, instruction didn't explicitly say to change to Model, and Code Edit was partial.
{
    use LogsActivity; // Added LogsActivity trait. HasFactory was not in original and not explicitly requested.
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
