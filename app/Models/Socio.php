<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class Socio extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'nombre',
        'documento',
        'telefono',
        'capital_inicial',
        'capital_disponible',
        'capital_comprometido',
        'ganancias_acumuladas',
        'perdidas_acumuladas',
        'porcentaje_ganancia_socio',
        'porcentaje_ganancia_dueno',
        'estado',
    ];
    
    protected $casts = [
        'capital_inicial' => 'decimal:2',
        'capital_disponible' => 'decimal:2',
        'capital_comprometido' => 'decimal:2',
        'ganancias_acumuladas' => 'decimal:2',
        'perdidas_acumuladas' => 'decimal:2',
        'porcentaje_ganancia_socio' => 'decimal:2',
        'porcentaje_ganancia_dueno' => 'decimal:2',
    ];

    public function prestamos()
    {
        return $this->belongsToMany(Prestamo::class, 'prestamo_socio')
                    ->withPivot('monto_aportado', 'porcentaje_participacion', 'porcentaje_ganancia_socio', 'porcentaje_ganancia_dueno')
                    ->withTimestamps();
    }

    public function ganancias()
    {
        return $this->hasMany(Ganancia::class);
    }
}
