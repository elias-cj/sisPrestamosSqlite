<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class Prestamo extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'cliente_id',
        'monto',
        'interes',
        'moneda_id',
        'fecha_inicio',
        'tipo_pago',
        'numero_cuotas',
        'valor_cuota',
        'estado',
    ];
    
    protected $casts = [
        'fecha_inicio' => 'date',
        'monto' => 'decimal:2',
        'interes' => 'decimal:2',
        'valor_cuota' => 'decimal:2',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function moneda()
    {
        return $this->belongsTo(Moneda::class);
    }
    
    public function socios()
    {
        return $this->belongsToMany(Socio::class, 'prestamo_socio')
                    ->using(PrestamoSocio::class)
                    ->withPivot('monto_aportado', 'porcentaje_participacion', 'porcentaje_ganancia_socio', 'porcentaje_ganancia_dueno')
                    ->withTimestamps();
    }
    
    public function cuotas()
    {
        return $this->hasMany(Cuota::class);
    }

    public function pagos()
    {
        return $this->hasManyThrough(Pago::class, Cuota::class);
    }
    
    public function ganancias()
    {
        return $this->hasMany(Ganancia::class);
    }
}
